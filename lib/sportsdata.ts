// lib/sportsdata.ts
// Thin wrapper around SportsData.io NFL STATS API
// Make sure you set SPORTSDATA_API_KEY in Vercel

const BASE_URL = "https://api.sportsdata.io/v3/nfl";

const API_KEY = process.env.SPORTSDATA_API_KEY;

if (!API_KEY) {
  console.warn("SPORTSDATA_API_KEY is not set. SportsData.io calls will fail.");
}

async function sdFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);

  // SportsData.io supports either query ?key= or header Ocp-Apim-Subscription-Key
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  url.searchParams.set("key", API_KEY || "");

  const res = await fetch(url.toString(), {
    // Next.js: cache for up to 60s by default, tweak as needed
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("SportsData.io error", res.status, url.toString(), text);
    throw new Error(`SportsData.io error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

/**
 * Basic player shape from SportsData.io (simplified)
 */
export interface Player {
  PlayerID: number;
  Team: string | null;
  Name: string;
  Position: string | null;
  Status?: string | null;
}

/**
 * PlayerGame stats (simplified)
 */
export interface PlayerGame {
  GameKey: string;
  Season: number;
  SeasonType: number;
  Week: number;
  Team: string;
  Opponent: string;
  PlayerID: number;
  Name: string;
  Position: string;

  RushingAttempts?: number | null;
  RushingYards?: number | null;
  ReceivingTargets?: number | null;
  ReceivingYards?: number | null;
  PassingAttempts?: number | null;
  PassingYards?: number | null;
}

/**
 * TeamGame stats (simplified – used for matchup context)
 */
export interface TeamGame {
  GameKey: string;
  Season: number;
  SeasonType: number;
  Week: number;
  Team: string;
  Opponent: string;
  RushingYards?: number | null;
  PassingYards?: number | null;
}

export interface Timeframe {
  Season: number;
  SeasonType: string; // "Regular"
  Week: number;
  Type: string; // "Current", "Upcoming", etc.
}

/**
 * All active players
 * /v3/nfl/scores/json/Players
 */
export async function getActivePlayers(): Promise<Player[]> {
  return sdFetch<Player[]>("/scores/json/Players");
}

/**
 * Player game stats for a season
 * /v3/nfl/stats/json/PlayerGameStatsByPlayerID/{season}/{playerId}
 */
export async function getPlayerGameStatsByPlayer(
  season: number,
  playerId: number
): Promise<PlayerGame[]> {
  return sdFetch<PlayerGame[]>(`/stats/json/PlayerGameStatsByPlayerID/${season}/${playerId}`);
}

/**
 * Team game stats by week (for matchup context)
 * /v3/nfl/stats/json/TeamGameStatsByWeek/{season}/{week}
 */
export async function getTeamGameStatsByWeek(
  season: number,
  week: number
): Promise<TeamGame[]> {
  return sdFetch<TeamGame[]>(`/stats/json/TeamGameStatsByWeek/${season}/${week}`);
}

/**
 * Timeframes – to know current season + week dynamically
 * /v3/nfl/scores/json/Timeframes/current
 */
export async function getCurrentTimeframe(): Promise<Timeframe[]> {
  return sdFetch<Timeframe[]>("/scores/json/Timeframes/current");
}
