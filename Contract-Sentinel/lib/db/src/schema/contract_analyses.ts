import { pgTable, text, integer, real, jsonb, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contractAnalysesTable = pgTable("contract_analyses", {
  id: serial("id").primaryKey(),
  address: text("address").notNull(),
  chain: text("chain").notNull(),
  riskScore: real("risk_score").notNull(),
  riskLevel: text("risk_level").notNull(),
  summary: text("summary").notNull(),
  vulnerabilities: jsonb("vulnerabilities").notNull().$type<Array<{
    type: string;
    severity: string;
    description: string;
    evidence?: string;
    recommendation?: string;
  }>>(),
  behavior: jsonb("behavior").notNull().$type<{
    canMint: boolean;
    upgradeable: boolean;
    ownershipType: string;
    hasPauseFunction: boolean;
    hasBlacklist: boolean;
    hasProxy: boolean;
  }>(),
  trustIndicators: jsonb("trust_indicators").notNull().$type<{
    isAudited: boolean;
    liquidityLocked: boolean;
    contractAgedays: number;
    transactionCount: number;
    verifiedSource: boolean;
  }>(),
  aiExplanation: jsonb("ai_explanation").notNull().$type<{
    overview: string;
    riskReasoning: string;
    userFriendlySummary: string;
  }>(),
  recommendations: jsonb("recommendations").notNull().$type<string[]>(),
  rawSource: text("raw_source"),
  analyzedAt: timestamp("analyzed_at").notNull().defaultNow(),
});

export const insertContractAnalysisSchema = createInsertSchema(contractAnalysesTable).omit({ id: true, analyzedAt: true });
export type InsertContractAnalysis = z.infer<typeof insertContractAnalysisSchema>;
export type ContractAnalysis = typeof contractAnalysesTable.$inferSelect;
