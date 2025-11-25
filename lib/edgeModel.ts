// lib/edgeModel.ts

import { americanToImplied } from "./odds";

export type ModelMarketCategory =
  | "yardage"
  | "receptions"
  | "points"
  | "assists"
  | "rebounds"
  | "threes"
  | "touchdown"
  | "other";

export interface EdgeInput {
  sport: "nfl" | "nba";
  marketKey: string;      // e.g. "player_pass_yds"
  line: number | null;    // e.g. 5.5
  odds: number;           // American odds
  player: string;
  game: string;
}

export interface EdgeOutput {
  impliedProb: number;    // market implied (0–1)
  modelProb: number;      // model’s estimate (0–1)
  edge: number;           // modelProb - impliedProb
  confidence: "low" | "medium" | "high";
  notes: string;
  category: ModelMarketCategory;
}

// Very rough market → category mapping. Easy to extend.
export function categorizeMarket(marketKey: string): ModelMarketCategory {
  if (marketKey.includes("pass_yds") || marketKey.includes("rush_yds") || marketKey.includes("rec_yds")) {
    return "yardage";
  }
  if (marketKey.includes("receptions")) return "receptions";
  if (marketKey.includes("points")) return "points";
  if (marketKey.includes("assists")) return "assists";
  if (marketKey.includes("rebounds")) return "rebounds";
  if (marketKey.includes("threes")) return "threes";
  if (marketKey.includes("anytime_td")) return "touchdown";
  return "other";
}

/**
 * Stub “AI model” for alpha:
 * - Uses market implied probability
 * - Nudges it up/down by a heuristic based on line + market
 * - Returns edge + confidence
 *
 * Later: replace the heuristic section with real stats,
 * but keep this function signature the same.
 */
export function computeEdge(input: EdgeInput): EdgeOutput {
  const implied = americanToImplied(input.odds);
  const category = categorizeMarket(input.marketKey);

  // ---------- Heuristic “true probability” model ----------
  // Baseline = market implied
  let modelProb = implied;

  // Gentle boosts/penalties based on category + line
  switch (category) {
    case "receptions":
    case "assists":
      // High-volume players tend to be slightly undervalued on safe alt lines
      if (input.line !== null && input.line <= 5.5) {
        modelProb += 0.04;
      } else if (input.line !== null && input.line >= 8.5) {
        modelProb -= 0.03;
      }
      break;
    case "yardage":
    case "points":
      if (input.line !== null && input.line <= 60) {
        modelProb += 0.02;
      } else if (input.line !== null && input.line >= 90) {
        modelProb -= 0.02;
      }
      break;
    case "touchdown":
      // TDs are volatile – don’t overconfidently boost
      modelProb -= 0.015;
      break;
    default:
      break;
  }

  // Clamp 0–1
  modelProb = Math.max(0.05, Math.min(0.95, modelProb));

  const edge = modelProb - implied;

  // Confidence bands based on absolute edge
  let confidence: "low" | "medium" | "high" = "low";
  const absEdge = Math.abs(edge);
  if (absEdge >= 0.05) confidence = "high";
  else if (absEdge >= 0.025) confidence = "medium";

  const notes =
    confidence === "high"
      ? "Model sees a strong mismatch vs market."
      : confidence === "medium"
      ? "Moderate value according to current model assumptions."
      : "Slight lean. Edge is small or market seems efficient.";

  return {
    impliedProb: implied,
    modelProb,
    edge,
    confidence,
    notes,
    category,
  };
}
