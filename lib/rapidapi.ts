// lib/rapidapi.ts
// Thin wrapper around several RapidAPI endpoints the project uses.
// All calls require RAPIDAPI_KEY to be set in your environment (Vercel/Next).

const RAPID_KEY = process.env.RAPIDAPI_KEY;

if (!RAPID_KEY) {
  console.warn("RAPIDAPI_KEY is not set. RapidAPI calls will fail at runtime.");
}

interface RapidRequestOptions {
  hostname: string;
  path: string;
  searchParams?: Record<string, string | number | undefined>;
}

async function rapidFetch<T>(opts: RapidRequestOptions): Promise<T> {
  const url = new URL(`https://${opts.hostname}${opts.path}`);

  if (opts.searchParams) {
    for (const [k, v] of Object.entries(opts.searchParams)) {
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, String(v));
      }
    }
  }

  const res = await fetch(url.toString(), {
    headers: {
      "x-rapidapi-key": RAPID_KEY || "",
      "x-rapidapi-host": opts.hostname,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("RapidAPI error", res.status, url.toString(), text);
    throw new Error(`RapidAPI error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// ---- Specific helpers for the APIs you listed ----

// API-Basketball odds
export async function getBasketballOdds(gameId: string) {
  return rapidFetch<any>({
    hostname: "api-basketball.p.rapidapi.com",
    path: "/odds",
    searchParams: { game: gameId },
  });
}

// Sportsbook advantages (e.g., arbitrage)
export async function getSportsbookAdvantages(type: string = "ARBITRAGE") {
  return rapidFetch<any>({
    hostname: "sportsbook-api2.p.rapidapi.com",
    path: "/v0/advantages/",
    searchParams: { type },
  });
}

// Odds-API scores (fixture-based)
export async function getOddsApiScores(fixtureId: string) {
  return rapidFetch<any>({
    hostname: "odds-api1.p.rapidapi.com",
    path: "/scores",
    searchParams: { fixtureId },
  });
}

// Livescore news
export async function getLivescoreNews(category: string = "soccer") {
  return rapidFetch<any>({
    hostname: "livescore6.p.rapidapi.com",
    path: "/news/list",
    searchParams: { category },
  });
}

// NFL API Data - team listing
export async function getNflTeamsRapid() {
  return rapidFetch<any>({
    hostname: "nfl-api-data.p.rapidapi.com",
    path: "/nfl-team-listing/v1/data",
  });
}

// NFL API Data - player statistics for a given athlete and year
// NOTE: This assumes the endpoint signature: /nfl-ath-statistics?id={athleteId}&year={year}
export async function getNflPlayerStats(athleteId: number | string, year: number | string) {
  return rapidFetch<any>({
    hostname: "nfl-api-data.p.rapidapi.com",
    path: "/nfl-ath-statistics",
    searchParams: {
      id: athleteId,
      year,
    },
  });
}
