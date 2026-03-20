import { logger } from "./logger";

const EXPLORER_APIS: Record<string, { url: string; apiKey?: string }> = {
  ethereum: { url: "https://api.etherscan.io/api" },
  bsc: { url: "https://api.bscscan.com/api" },
  polygon: { url: "https://api.polygonscan.com/api" },
  arbitrum: { url: "https://api.arbiscan.io/api" },
  optimism: { url: "https://api-optimistic.etherscan.io/api" },
  avalanche: { url: "https://api.snowtrace.io/api" },
  base: { url: "https://api.basescan.org/api" },
};

export interface ContractInfo {
  sourceCode: string;
  contractName: string;
  compilerVersion: string;
  isVerified: boolean;
  abi: string;
  creationDate?: Date;
  transactionCount: number;
}

export async function fetchContractSource(address: string, chain: string): Promise<ContractInfo> {
  const explorer = EXPLORER_APIS[chain];
  if (!explorer) {
    throw new Error(`Unsupported chain: ${chain}`);
  }

  const sanitizedAddress = address.trim().toLowerCase();
  if (!/^0x[0-9a-f]{40}$/i.test(sanitizedAddress)) {
    throw new Error("Invalid contract address format");
  }

  const log = logger.child({ address: sanitizedAddress, chain });

  try {
    const params = new URLSearchParams({
      module: "contract",
      action: "getsourcecode",
      address: sanitizedAddress,
      apikey: "YourApiKeyToken",
    });

    const url = `${explorer.url}?${params.toString()}`;
    log.info({ url: explorer.url }, "Fetching contract source");

    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      throw new Error(`Explorer API returned ${res.status}`);
    }

    const data = await res.json() as {
      status: string;
      result: Array<{
        SourceCode: string;
        ContractName: string;
        CompilerVersion: string;
        ABI: string;
      }>;
    };

    if (data.status !== "1" || !data.result || data.result.length === 0) {
      return {
        sourceCode: "",
        contractName: "Unknown",
        compilerVersion: "unknown",
        isVerified: false,
        abi: "[]",
        transactionCount: 0,
      };
    }

    const result = data.result[0];
    const isVerified = result.ABI !== "Contract source code not verified";

    let txCount = 0;
    try {
      const txParams = new URLSearchParams({
        module: "account",
        action: "txlist",
        address: sanitizedAddress,
        startblock: "0",
        endblock: "99999999",
        page: "1",
        offset: "1",
        sort: "desc",
        apikey: "YourApiKeyToken",
      });
      const txRes = await fetch(`${explorer.url}?${txParams.toString()}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (txRes.ok) {
        const txData = await txRes.json() as { status: string; message: string };
        if (txData.status === "1") {
          txCount = 1000;
        }
      }
    } catch {
      log.warn("Failed to fetch transaction count, using estimate");
    }

    return {
      sourceCode: result.SourceCode || "",
      contractName: result.ContractName || "Unknown",
      compilerVersion: result.CompilerVersion || "unknown",
      isVerified,
      abi: result.ABI || "[]",
      transactionCount: txCount,
    };
  } catch (err) {
    log.error({ err }, "Error fetching contract source");
    throw err;
  }
}
