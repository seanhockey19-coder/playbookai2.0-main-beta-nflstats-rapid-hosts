import { fetchJson } from "@/lib/http";
import type { Provider } from "./index";
import type { SportKey, Game, Prop } from "@/lib/types";

const RAPID_KEY = process.env.RAPIDAPI_KEY;
const HOST = process.env.RAPIDAPI_NBA_HOST || ""; // api-basketball.p.rapidapi.com

async function raFetch<T>(path: string): Promise<T> {
  if (!RAPID_KEY || !HOST) throw new Error("RapidAPI api-basketball not configured");
  const url = `https://${HOST}${path}`;
  return fetchJson<T>(url, {
    headers: {
      "x-rapidapi-key": RAPID_KEY as string,
      "x-rapidapi-host": HOST as string,
    },
  });
}

type ApiBasketballOddsResponse = {
  response: Array<{
    id: number;
    bookmaker: { id: number; name: string };
    update: string;
    bets: Array<{
      id: number;
      name: string;
      values: Array<{ value: string; odd: string; handicap?: string }>;
    }>;
  }>;
};

// This provider is props-only (requires known api-basketball game id).
export const RapidApiApiBasketballProvider: Provider = {
  name: "rapidapi:api-basketball",
  async healthy() {
    if (!RAPID_KEY || !HOST) return false;
    try {
      // cheap endpoint to verify host/key is valid
      await raFetch("/bookmakers");
      return true;
    } catch { return false; }
  },
  async getGames(_sport: SportKey): Promise<Game[]> {
    // We do not pull fixtures here; rely on primary games provider.
    return [];
  },
  async getPropsForGame(sport: SportKey, gameId: string): Promise<Prop[]> {
    if (sport !== "basketball_nba") return [];
    // gameId here is expected to be the api-basketball game id (raGameId)
    const data = await raFetch<ApiBasketballOddsResponse>(`/odds?game=${encodeURIComponent(gameId)}`);
    const out: Prop[] = [];
    for (const r of data?.response ?? []) {
      for (const b of r.bets ?? []) {
        for (const v of b.values ?? []) {
          // Map bet name/value to a pseudo "market/line"
          const player = v.value || b.name;
          const line = v.handicap ? Number(v.handicap) : null;
          const price = Number(v.odd);
          out.push({
            id: `${b.id}:${player}:${r.bookmaker?.name || "api-basketball"}`,
            sport,
            gameId,            // NOTE: api-basketball game id
            gameLabel: "",     // unknown in this response
            player,
            market: b.name,
            line: isNaN(Number(line)) ? null : Number(line),
            odds: isNaN(price) ? 0 : price >= 2 ? Math.round((price - 1) * 100) : Math.round(-100 / (price - 1)), // convert decimal-ish to american guess
            bookmaker: r.bookmaker?.name,
            homeTeam: "",
            awayTeam: "",
          });
        }
      }
    }
    return out.filter(p => p.player && p.market);
  },
};
