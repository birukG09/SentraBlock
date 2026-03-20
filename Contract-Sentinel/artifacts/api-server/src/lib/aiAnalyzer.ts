import OpenAI from "openai";
import { VulnerabilityFinding, BehaviorAnalysis } from "./staticAnalyzer";

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

export interface AiExplanation {
  overview: string;
  riskReasoning: string;
  userFriendlySummary: string;
}

export async function generateAiExplanation(params: {
  address: string;
  chain: string;
  contractName: string;
  riskScore: number;
  riskLevel: string;
  vulnerabilities: VulnerabilityFinding[];
  behavior: BehaviorAnalysis;
  sourceCodeSnippet: string;
}): Promise<AiExplanation> {
  const { address, chain, contractName, riskScore, riskLevel, vulnerabilities, behavior, sourceCodeSnippet } = params;

  const vulnSummary = vulnerabilities.length > 0
    ? vulnerabilities.map(v => `- ${v.type} (${v.severity}): ${v.description}`).join("\n")
    : "No significant vulnerabilities detected.";

  const behaviorSummary = `
- Can Mint: ${behavior.canMint}
- Upgradeable: ${behavior.upgradeable}
- Ownership Type: ${behavior.ownershipType}
- Has Pause Function: ${behavior.hasPauseFunction}
- Has Blacklist: ${behavior.hasBlacklist}
`.trim();

  const snippet = sourceCodeSnippet ? sourceCodeSnippet.slice(0, 3000) : "Source code not available.";

  const systemPrompt = `You are a blockchain security expert analyzing smart contracts for risk. 
Provide clear, accurate, and actionable analysis. Use plain language that both technical and non-technical users can understand.
Be direct and factual. Never make up information not supported by the evidence.`;

  const userPrompt = `Analyze this smart contract:

Contract: ${contractName} (${address}) on ${chain}
Risk Score: ${riskScore}/100 (${riskLevel.toUpperCase()})

Detected Vulnerabilities:
${vulnSummary}

Contract Behavior:
${behaviorSummary}

Source Code (excerpt):
\`\`\`solidity
${snippet}
\`\`\`

Provide a JSON response with exactly these three fields:
1. "overview" - A 2-3 sentence technical overview of what this contract does and its key characteristics (max 200 words)
2. "riskReasoning" - A detailed explanation of why this contract received a ${riskLevel} risk rating, discussing the specific vulnerabilities and how they could impact users (max 300 words)
3. "userFriendlySummary" - A simple, jargon-free explanation for retail investors about whether this contract appears safe to interact with and key things to watch out for (max 150 words)

Respond ONLY with valid JSON, no markdown fences.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = response.choices[0]?.message?.content?.trim() ?? "";
    const parsed = JSON.parse(content) as AiExplanation;

    return {
      overview: parsed.overview || "Analysis not available.",
      riskReasoning: parsed.riskReasoning || "Risk reasoning not available.",
      userFriendlySummary: parsed.userFriendlySummary || "Summary not available.",
    };
  } catch {
    return {
      overview: `This is a ${contractName} contract deployed on ${chain}. ${behavior.canMint ? "It has minting capabilities." : ""} ${behavior.upgradeable ? "It is upgradeable." : ""}`.trim(),
      riskReasoning: `The contract received a ${riskLevel} risk score of ${riskScore}/100 based on ${vulnerabilities.length} detected findings. ${vulnerabilities.length > 0 ? `Key concerns include: ${vulnerabilities.slice(0, 2).map(v => v.type).join(", ")}.` : "No major vulnerabilities were detected."}`,
      userFriendlySummary: riskLevel === "low"
        ? "This contract appears relatively safe based on automated analysis. However, always do your own research before investing."
        : riskLevel === "medium"
          ? "This contract has some concerning patterns. Proceed with caution and verify the team's identity and audit status before investing."
          : "This contract has significant red flags. Exercise extreme caution — only interact if you fully understand the risks involved.",
    };
  }
}

export function generateRecommendations(
  vulnerabilities: VulnerabilityFinding[],
  behavior: BehaviorAnalysis,
  isVerified: boolean,
  riskLevel: string,
): string[] {
  const recommendations: string[] = [];

  if (!isVerified) {
    recommendations.push("The contract source code is not verified. Do not interact with unverified contracts.");
  }

  if (riskLevel === "high") {
    recommendations.push("High risk detected — avoid investing unless you are an experienced user who fully understands the risks.");
  }

  for (const vuln of vulnerabilities) {
    if (vuln.recommendation && !recommendations.includes(vuln.recommendation)) {
      recommendations.push(vuln.recommendation);
    }
  }

  if (behavior.upgradeable) {
    recommendations.push("Verify that contract upgrades require multi-signature approval or a timelock.");
  }

  if (behavior.ownershipType === "single_owner") {
    recommendations.push("Check who owns this contract — single-owner contracts carry higher centralization risk.");
  }

  if (!recommendations.some(r => r.includes("DYOR"))) {
    recommendations.push("Always do your own research (DYOR) and never invest more than you can afford to lose.");
  }

  return recommendations.slice(0, 6);
}
