// lib/nflStatsEngine.ts
// Utilities to turn NFL API Data player statistics into useful aggregates
// for CoachesPlaybookAI. This is written to be defensive about the exact
// JSON shape returned by the RapidAPI provider, so that small schema
// differences don't crash the app.

export interface NflGameStat {
  gameId?: string;
  week?: number;
  opponent?: string;
  team?: string;
  rushingYards?: number;
  rushingAttempts?: number;
  receivingYards?: number;
  receivingTargets?: number;
  receptions?: number;
  passingYards?: number;
  passingAttempts?: number;
}

export interface NflPlayerSummary {
  athleteId: string | number;
  name?: string;
  position?: string;
  team?: string;
  season?: number;
  games: NflGameStat[];
  last5: NflGameStat[];
  avgRushingYards?: number;
  avgReceivingYards?: number;
  avgPassingYards?: number;
}

/**
 * Small helpers
 */
function safeNumber(v: any): number | undefined {
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : undefined;
}

function mean(values: number[]): number | undefined {
  if (!values.length) return undefined;
  const total = values.reduce((a, b) => a + b, 0);
  return total / values.length;
}

/**
 * Attempt to normalise one "game" record from the NFL API Data provider
 * into our internal NflGameStat shape. This is intentionally conservative
 * and will just skip fields that don't exist instead of throwing.
 */
export function normaliseGameRecord(raw: any): NflGameStat {
  // Different providers use different field names, so we try several.
  const week =
    safeNumber(raw.week) ??
    safeNumber(raw.Week) ??
    safeNumber(raw.game_week);

  const rushingYards =
    safeNumber(raw.rush_yds) ??
    safeNumber(raw.rushingYards) ??
    safeNumber(raw.rushYards);

  const rushingAttempts =
    safeNumber(raw.rush_att) ??
    safeNumber(raw.rushingAttempts) ??
    safeNumber(raw.carries);

  const receivingYards =
    safeNumber(raw.rec_yds) ??
    safeNumber(raw.receivingYards) ??
    safeNumber(raw.recYards);

  const receivingTargets =
    safeNumber(raw.targets) ??
    safeNumber(raw.rec_tgt) ??
    safeNumber(raw.receivingTargets);

  const receptions =
    safeNumber(raw.receptions) ??
    safeNumber(raw.rec) ??
    safeNumber(raw.catches);

  const passingYards =
    safeNumber(raw.pass_yds) ??
    safeNumber(raw.passingYards) ??
    safeNumber(raw.passYards);

  const passingAttempts =
    safeNumber(raw.pass_att) ??
    safeNumber(raw.passingAttempts) ??
    safeNumber(raw.passAttempts);

  return {
    gameId: raw.game_id ?? raw.gameId ?? raw.GameId,
    week: week,
    opponent: raw.opponent ?? raw.opp ?? raw.Opponent,
    team: raw.team ?? raw.Team,
    rushingYards,
    rushingAttempts,
    receivingYards,
    receivingTargets,
    receptions,
    passingYards,
    passingAttempts,
  };
}

/**
 * Given the raw JSON returned by the provider, attempt to build a
 * NflPlayerSummary object with last-5 and seasonal averages. This function
 * is resilient to the top-level shape: it will look for an array under
 * common keys like `stats`, `data`, or use the value directly if the
 * payload itself is an array.
 */
export function buildPlayerSummary(
  athleteId: string | number,
  season: number,
  payload: any
): NflPlayerSummary {
  // Try to locate the array of game stats
  const possibleArrays: any[] = [];

  if (Array.isArray(payload)) possibleArrays.push(payload);
  if (Array.isArray(payload?.stats)) possibleArrays.push(payload.stats);
  if (Array.isArray(payload?.data)) possibleArrays.push(payload.data);
  if (Array.isArray(payload?.games)) possibleArrays.push(payload.games);
  if (Array.isArray(payload?.gameLog)) possibleArrays.push(payload.gameLog);

  const gamesRaw: any[] = possibleArrays[0] || [];

  const games: NflGameStat[] = gamesRaw.map(normaliseGameRecord);

  // last 5 games by week descending
  const sorted = [...games].sort((a, b) => (b.week || 0) - (a.week || 0));
  const last5 = sorted.slice(0, 5);

  const rushValues = last5
    .map((g) => g.rushingYards)
    .filter((v): v is number => typeof v === "number");
  const recValues = last5
    .map((g) => g.receivingYards)
    .filter((v): v is number => typeof v === "number");
  const passValues = last5
    .map((g) => g.passingYards)
    .filter((v): v is number => typeof v === "number");

  return {
    athleteId,
    season,
    games,
    last5,
    avgRushingYards: mean(rushValues),
    avgReceivingYards: mean(recValues),
    avgPassingYards: mean(passValues),
  };
}
