// lib/statsEngine.ts
import type { PlayerGame, TeamGame } from "./sportsdata";

export type MarketType = "rushing" | "receiving" | "passing";

export interface RecentStats {
  games: PlayerGame[];
  yards: number[];
  avgYards: number;
  stdDevYards: number;
  avgVolume: number;
  coefficientOfVariation: number;
}

export interface MatchupContext {
  oppAllowedYardsPerGameToPos: number;
}

export interface ProjectionResult {
  projectedMean: number;
  recent: RecentStats;
  matchup: MatchupContext;
}

export interface LadderLegSuggestion {
  playerId: number;
  playerName: string;
  team: string;
  opponent: string;
  market: MarketType;
  line: number;
  projectedMean: number;
  probabilityOver: number;
  aiConfidence: number; // 0–100
  riskTier: "ultra-safe" | "very-safe" | "safe" | "medium";
  lastNGames: { week: number; yards: number }[];
}

// ---- numeric helpers ----

function calcMean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function calcStdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = calcMean(values);
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
    (values.length - 1);
  return Math.sqrt(variance);
}

// quick and dirty normal CDF approximation for z-score
function probFromZ(z: number): number {
  // clamp extremes
  if (z > 3) return 0.999;
  if (z < -3) return 0.001;
  // simple tanh-based smoothing
  const p = 0.5 * (1 + Math.tanh(0.707 * z));
  return p;
}

// ---- core logic ----

export function buildRecentStats(
  games: PlayerGame[],
  market: MarketType,
  maxGames: number = 5
): RecentStats {
  const sorted = [...games].sort((a, b) => b.Week - a.Week);
  const recent = sorted.slice(0, maxGames);

  const yards = recent.map((g) => {
    if (market === "rushing") return g.RushingYards ?? 0;
    if (market === "receiving") return g.ReceivingYards ?? 0;
    return g.PassingYards ?? 0;
  });

  const volume = recent.map((g) => {
    if (market === "rushing") return g.RushingAttempts ?? 0;
    if (market === "receiving") return g.ReceivingTargets ?? 0;
    return g.PassingAttempts ?? 0;
  });

  const avgYards = calcMean(yards);
  const stdDevYards = calcStdDev(yards);
  const avgVolume = calcMean(volume);
  const coefficientOfVariation = avgYards > 0 ? stdDevYards / avgYards : 999;

  return {
    games: recent,
    yards,
    avgYards,
    stdDevYards,
    avgVolume,
    coefficientOfVariation,
  };
}

export function buildMatchupContext(
  teamGames: TeamGame[],
  opponentAbbr: string,
  market: MarketType
): MatchupContext {
  const defGames = teamGames.filter((g) => g.Team === opponentAbbr);
  const yardsAllowed = defGames.map((g) => {
    // crude but workable: use team passing yards allowed as proxy for WR/TE,
    // and rushing yards allowed as proxy for RB rush.
    if (market === "rushing") return g.RushingYards ?? 0;
    if (market === "receiving") return g.PassingYards ?? 0;
    return g.PassingYards ?? 0;
  });

  const oppAllowedYardsPerGameToPos = calcMean(yardsAllowed);
  return { oppAllowedYardsPerGameToPos };
}

export function projectPlayerYards(
  recent: RecentStats,
  matchup: MatchupContext
): ProjectionResult {
  // Simple weighted blend: 70% player, 30% opponent tendency
  const projectedMean =
    0.7 * recent.avgYards + 0.3 * matchup.oppAllowedYardsPerGameToPos;

  return { projectedMean, recent, matchup };
}

export function suggestLadderLeg(
  playerId: number,
  playerName: string,
  teamAbbr: string,
  opponentAbbr: string,
  market: MarketType,
  projection: ProjectionResult,
  safeLine: number
): LadderLegSuggestion {
  const { projectedMean, recent } = projection;

  const std = recent.stdDevYards || projectedMean * 0.25 || 10; // fallback so we never divide by 0
  const z = (projectedMean - safeLine) / std;
  const probabilityOver = probFromZ(z);

  let riskTier: LadderLegSuggestion["riskTier"];
  if (probabilityOver >= 0.90) riskTier = "ultra-safe";
  else if (probabilityOver >= 0.85) riskTier = "very-safe";
  else if (probabilityOver >= 0.80) riskTier = "safe";
  else riskTier = "medium";

  const aiConfidence = Math.round(probabilityOver * 100);

  const lastNGames = recent.games.map((g, idx) => ({
    week: g.Week,
    yards: recent.yards[idx] ?? 0,
  }));

  return {
    playerId,
    playerName,
    team: teamAbbr,
    opponent: opponentAbbr,
    market,
    line: safeLine,
    projectedMean,
    probabilityOver,
    aiConfidence,
    riskTier,
    lastNGames,
  };
}
