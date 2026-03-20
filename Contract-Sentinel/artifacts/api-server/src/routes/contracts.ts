import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { contractAnalysesTable } from "@workspace/db";
import { AnalyzeContractBody, GetAnalysisHistoryQueryParams, GetAnalysisByIdParams } from "@workspace/api-zod";
import { fetchContractSource } from "../lib/contractFetcher";
import { runStaticAnalysis, computeRiskScore, getRiskLevel } from "../lib/staticAnalyzer";
import { generateAiExplanation, generateRecommendations } from "../lib/aiAnalyzer";
import { desc, eq, count } from "drizzle-orm";

const router: IRouter = Router();

router.post("/contracts/analyze", async (req, res) => {
  const parseResult = AnalyzeContractBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "validation_error", message: parseResult.error.message });
    return;
  }

  const { address, chain } = parseResult.data;
  req.log.info({ address, chain }, "Starting contract analysis");

  try {
    const contractInfo = await fetchContractSource(address, chain);

    const staticResult = runStaticAnalysis(contractInfo.sourceCode, contractInfo.isVerified);

    const contractAgedays = contractInfo.creationDate
      ? Math.floor((Date.now() - contractInfo.creationDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const riskScore = computeRiskScore(
      staticResult.vulnerabilities,
      contractInfo.isVerified,
      contractInfo.transactionCount,
      contractAgedays,
    );
    const riskLevel = getRiskLevel(riskScore);

    const trustIndicators = {
      isAudited: contractInfo.sourceCode.includes("@audit") || contractInfo.sourceCode.includes("Certik") || contractInfo.sourceCode.includes("OpenZeppelin") ? true : false,
      liquidityLocked: false,
      contractAgedays,
      transactionCount: contractInfo.transactionCount,
      verifiedSource: contractInfo.isVerified,
    };

    const summary = contractInfo.isVerified
      ? `${contractInfo.contractName} contract on ${chain} with ${staticResult.vulnerabilities.length} vulnerability finding(s). Risk score: ${riskScore}/100.`
      : `Unverified contract on ${chain}. Source code not available for analysis. Risk score: ${riskScore}/100.`;

    const aiExplanation = await generateAiExplanation({
      address,
      chain,
      contractName: contractInfo.contractName,
      riskScore,
      riskLevel,
      vulnerabilities: staticResult.vulnerabilities,
      behavior: staticResult.behavior,
      sourceCodeSnippet: contractInfo.sourceCode,
    });

    const recommendations = generateRecommendations(
      staticResult.vulnerabilities,
      staticResult.behavior,
      contractInfo.isVerified,
      riskLevel,
    );

    const [inserted] = await db.insert(contractAnalysesTable).values({
      address: address.toLowerCase(),
      chain,
      riskScore,
      riskLevel,
      summary,
      vulnerabilities: staticResult.vulnerabilities,
      behavior: staticResult.behavior,
      trustIndicators,
      aiExplanation,
      recommendations,
      rawSource: contractInfo.sourceCode ? contractInfo.sourceCode.slice(0, 50000) : null,
    }).returning();

    req.log.info({ id: inserted.id, riskScore, riskLevel }, "Contract analysis complete");

    res.json({
      id: inserted.id,
      address: inserted.address,
      chain: inserted.chain,
      riskScore: inserted.riskScore,
      riskLevel: inserted.riskLevel,
      summary: inserted.summary,
      vulnerabilities: inserted.vulnerabilities,
      behavior: inserted.behavior,
      trustIndicators: inserted.trustIndicators,
      aiExplanation: inserted.aiExplanation,
      recommendations: inserted.recommendations,
      analyzedAt: inserted.analyzedAt,
    });
  } catch (err) {
    req.log.error({ err }, "Contract analysis failed");
    const message = err instanceof Error ? err.message : "Analysis failed";
    if (message.includes("Invalid contract address")) {
      res.status(400).json({ error: "invalid_address", message });
    } else if (message.includes("Unsupported chain")) {
      res.status(400).json({ error: "unsupported_chain", message });
    } else {
      res.status(500).json({ error: "analysis_failed", message });
    }
  }
});

router.get("/contracts/history", async (req, res) => {
  const parseResult = GetAnalysisHistoryQueryParams.safeParse(req.query);
  const limit = parseResult.success ? (parseResult.data.limit ?? 20) : 20;
  const offset = parseResult.success ? (parseResult.data.offset ?? 0) : 0;

  try {
    const [items, totalResult] = await Promise.all([
      db.select({
        id: contractAnalysesTable.id,
        address: contractAnalysesTable.address,
        chain: contractAnalysesTable.chain,
        riskScore: contractAnalysesTable.riskScore,
        riskLevel: contractAnalysesTable.riskLevel,
        summary: contractAnalysesTable.summary,
        analyzedAt: contractAnalysesTable.analyzedAt,
      })
        .from(contractAnalysesTable)
        .orderBy(desc(contractAnalysesTable.analyzedAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(contractAnalysesTable),
    ]);

    res.json({
      items,
      total: totalResult[0]?.count ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch history");
    res.status(500).json({ error: "fetch_failed", message: "Failed to retrieve history" });
  }
});

router.get("/contracts/history/:id", async (req, res) => {
  const parseResult = GetAnalysisByIdParams.safeParse(req.params);
  if (!parseResult.success) {
    res.status(400).json({ error: "invalid_id", message: "Invalid ID" });
    return;
  }

  const { id } = parseResult.data;

  try {
    const [analysis] = await db.select().from(contractAnalysesTable).where(eq(contractAnalysesTable.id, id)).limit(1);

    if (!analysis) {
      res.status(404).json({ error: "not_found", message: `Analysis ${id} not found` });
      return;
    }

    res.json({
      id: analysis.id,
      address: analysis.address,
      chain: analysis.chain,
      riskScore: analysis.riskScore,
      riskLevel: analysis.riskLevel,
      summary: analysis.summary,
      vulnerabilities: analysis.vulnerabilities,
      behavior: analysis.behavior,
      trustIndicators: analysis.trustIndicators,
      aiExplanation: analysis.aiExplanation,
      recommendations: analysis.recommendations,
      analyzedAt: analysis.analyzedAt,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch analysis");
    res.status(500).json({ error: "fetch_failed", message: "Failed to retrieve analysis" });
  }
});

export default router;
