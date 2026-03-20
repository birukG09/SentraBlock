export interface VulnerabilityFinding {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  evidence: string;
  recommendation: string;
}

export interface BehaviorAnalysis {
  canMint: boolean;
  upgradeable: boolean;
  ownershipType: string;
  hasPauseFunction: boolean;
  hasBlacklist: boolean;
  hasProxy: boolean;
}

export interface StaticAnalysisResult {
  vulnerabilities: VulnerabilityFinding[];
  behavior: BehaviorAnalysis;
  rawFlags: Record<string, boolean>;
}

function detectPattern(source: string, pattern: RegExp | string): boolean {
  if (typeof pattern === "string") {
    return source.includes(pattern);
  }
  return pattern.test(source);
}

export function runStaticAnalysis(sourceCode: string, isVerified: boolean): StaticAnalysisResult {
  const vulnerabilities: VulnerabilityFinding[] = [];
  const normalizedSource = sourceCode.toLowerCase();

  if (!isVerified || !sourceCode) {
    return {
      vulnerabilities: [{
        type: "unverified_contract",
        severity: "critical",
        description: "Contract source code is not verified on the blockchain explorer.",
        evidence: "No source code available for analysis.",
        recommendation: "Only interact with contracts that have verified source code on the blockchain explorer.",
      }],
      behavior: {
        canMint: false,
        upgradeable: false,
        ownershipType: "unknown",
        hasPauseFunction: false,
        hasBlacklist: false,
        hasProxy: false,
      },
      rawFlags: { unverified: true },
    };
  }

  const rawFlags: Record<string, boolean> = {};

  // Reentrancy detection
  const hasReentrancyGuard = detectPattern(normalizedSource, "reentrancyguard") ||
    detectPattern(normalizedSource, "nonreentrant");
  const hasExternalCall = detectPattern(normalizedSource, ".call{value") ||
    detectPattern(normalizedSource, ".transfer(") ||
    detectPattern(normalizedSource, ".send(");
  const hasStateAfterCall = detectPattern(normalizedSource, /\.call\{.*\}.*\n.*=\s/);

  rawFlags.reentrancy_risk = hasExternalCall && !hasReentrancyGuard;
  if (rawFlags.reentrancy_risk) {
    vulnerabilities.push({
      type: "reentrancy",
      severity: "high",
      description: "Contract makes external calls without reentrancy protection, which could allow an attacker to repeatedly call back into the contract before state updates.",
      evidence: "External call patterns detected without ReentrancyGuard modifier.",
      recommendation: "Implement the checks-effects-interactions pattern and use OpenZeppelin's ReentrancyGuard.",
    });
  }

  // Owner privilege / centralization
  const hasOwner = detectPattern(normalizedSource, "onlyowner") ||
    detectPattern(normalizedSource, "ownable");
  const hasMultipleOwnerFunctions = (normalizedSource.match(/onlyowner/g) || []).length > 3;
  rawFlags.owner_privilege = hasOwner && hasMultipleOwnerFunctions;
  if (rawFlags.owner_privilege) {
    vulnerabilities.push({
      type: "owner_privilege",
      severity: "medium",
      description: "The contract owner has extensive control over contract functionality, creating centralization risk.",
      evidence: `Found ${(normalizedSource.match(/onlyowner/g) || []).length} owner-restricted functions.`,
      recommendation: "Consider using a multi-signature wallet for ownership and implementing a timelock for sensitive operations.",
    });
  }

  // Mint function
  const hasMint = detectPattern(normalizedSource, "function mint") ||
    detectPattern(normalizedSource, "_mint(") ||
    detectPattern(normalizedSource, "function _mint");
  rawFlags.has_mint = hasMint;
  if (hasMint) {
    const mintUnrestricted = !detectPattern(normalizedSource, "onlyowner") &&
      !detectPattern(normalizedSource, "onlyminter") &&
      !detectPattern(normalizedSource, "require(msg.sender");
    if (mintUnrestricted) {
      vulnerabilities.push({
        type: "unrestricted_mint",
        severity: "critical",
        description: "The contract has a mint function that may not be properly restricted, potentially allowing unlimited token creation.",
        evidence: "Mint function found without clear access control.",
        recommendation: "Ensure mint functions are properly access-controlled and consider implementing a max supply cap.",
      });
    } else {
      vulnerabilities.push({
        type: "mint_function",
        severity: "low",
        description: "Contract contains a mint function controlled by privileged addresses.",
        evidence: "Mint function with access control detected.",
        recommendation: "Verify the mint access controls are appropriate and consider a maximum supply cap.",
      });
    }
  }

  // Upgradeability
  const hasProxy = detectPattern(normalizedSource, "delegatecall") ||
    detectPattern(normalizedSource, "upgradeable") ||
    detectPattern(normalizedSource, "uups") ||
    detectPattern(normalizedSource, "transparent proxy") ||
    detectPattern(normalizedSource, "proxy");
  rawFlags.upgradeable = hasProxy;
  if (hasProxy) {
    vulnerabilities.push({
      type: "upgradeability",
      severity: "medium",
      description: "Contract uses proxy patterns that allow the implementation to be upgraded, which could change contract behavior.",
      evidence: "Proxy or upgradeability patterns detected.",
      recommendation: "Verify the upgrade admin is a multisig and there is a timelock on upgrades. Review upgrade history.",
    });
  }

  // Liquidity risk
  const hasLiquidityManipulation = detectPattern(normalizedSource, "swapandliquify") ||
    detectPattern(normalizedSource, "removeliquidity") ||
    detectPattern(normalizedSource, "addliquidity");
  rawFlags.liquidity_risk = hasLiquidityManipulation;
  if (hasLiquidityManipulation) {
    vulnerabilities.push({
      type: "liquidity_risk",
      severity: "medium",
      description: "Contract contains functions that can manipulate liquidity, which may be used to rug pull investors.",
      evidence: "Liquidity manipulation functions detected.",
      recommendation: "Verify liquidity is locked in a trusted locker. Research team identity before investing.",
    });
  }

  // Self-destruct
  const hasSelfDestruct = detectPattern(normalizedSource, "selfdestruct(") ||
    detectPattern(normalizedSource, "suicide(");
  rawFlags.self_destruct = hasSelfDestruct;
  if (hasSelfDestruct) {
    vulnerabilities.push({
      type: "self_destruct",
      severity: "high",
      description: "Contract can be permanently destroyed, erasing all funds and functionality.",
      evidence: "selfdestruct() call detected.",
      recommendation: "Avoid contracts with selfdestruct unless you fully understand the admin controls.",
    });
  }

  // Hidden fees / tax
  const hasTransferTax = detectPattern(normalizedSource, "transfertax") ||
    detectPattern(normalizedSource, "_taxfee") ||
    detectPattern(normalizedSource, "liquidityfee") ||
    detectPattern(normalizedSource, "marketingfee");
  rawFlags.transfer_tax = hasTransferTax;
  if (hasTransferTax) {
    vulnerabilities.push({
      type: "transfer_tax",
      severity: "low",
      description: "Contract implements transfer taxes/fees that reduce the amount received in each transaction.",
      evidence: "Tax/fee variables detected in transfer logic.",
      recommendation: "Check the fee percentages and whether they can be changed by the owner.",
    });
  }

  // Blacklist
  const hasBlacklist = detectPattern(normalizedSource, "blacklist") ||
    detectPattern(normalizedSource, "_isblacklisted") ||
    detectPattern(normalizedSource, "blocklist");
  rawFlags.has_blacklist = hasBlacklist;
  if (hasBlacklist) {
    vulnerabilities.push({
      type: "blacklist",
      severity: "medium",
      description: "Contract can blacklist addresses, preventing them from transferring tokens.",
      evidence: "Blacklist/blocklist functionality detected.",
      recommendation: "Be aware that your address could be blacklisted, rendering your tokens non-transferable.",
    });
  }

  // Determine ownership type
  let ownershipType = "none";
  if (detectPattern(normalizedSource, "multisig") || detectPattern(normalizedSource, "gnosis")) {
    ownershipType = "multisig";
  } else if (detectPattern(normalizedSource, "timelock")) {
    ownershipType = "timelock";
  } else if (detectPattern(normalizedSource, "ownable") || detectPattern(normalizedSource, "onlyowner")) {
    ownershipType = "single_owner";
  } else if (detectPattern(normalizedSource, "governance") || detectPattern(normalizedSource, "governor")) {
    ownershipType = "dao";
  }

  const hasPauseFunction = detectPattern(normalizedSource, "pause(") ||
    detectPattern(normalizedSource, "whennotpaused") ||
    detectPattern(normalizedSource, "pausable");

  return {
    vulnerabilities,
    behavior: {
      canMint: hasMint,
      upgradeable: hasProxy,
      ownershipType,
      hasPauseFunction,
      hasBlacklist,
      hasProxy,
    },
    rawFlags,
  };
}

export function computeRiskScore(
  vulnerabilities: VulnerabilityFinding[],
  isVerified: boolean,
  transactionCount: number,
  contractAgedays: number,
): number {
  let score = 0;

  if (!isVerified) return 90;

  for (const vuln of vulnerabilities) {
    if (vuln.severity === "critical") score += 30;
    else if (vuln.severity === "high") score += 20;
    else if (vuln.severity === "medium") score += 10;
    else if (vuln.severity === "low") score += 5;
  }

  if (transactionCount > 10000) score -= 10;
  else if (transactionCount > 1000) score -= 5;

  if (contractAgedays > 365) score -= 10;
  else if (contractAgedays < 7) score += 10;

  return Math.min(100, Math.max(0, score));
}

export function getRiskLevel(score: number): "low" | "medium" | "high" {
  if (score < 40) return "low";
  if (score < 70) return "medium";
  return "high";
}
