import { fetchJson } from "@/lib/http";
import type { Provider } from "./index";
import type { SportKey, Game, Prop } from "@/lib/types";

const RAPID_KEY = process.env.RAPIDAPI_KEY;
const HOST = process.env.RAPIDAPI_ODDS_HOST || "";

// NOTE: RapidAPI providers vary. We normalize a likely shape; adjust mapping if needed.
// Expected endpoints (examples):
//   GET https://{HOST}/v1/odds?sport=nba|nfl
//   GET https://{HOST}/v1/props?sport=nba|nfl&gameId=...
async function raFetch<T>(path: string): Promise<T> {
  if (!RAPID_KEY || !HOST) throw new Error("RapidAPI not configured");
  const url = `https://${HOST}${path}`;
  return fetchJson<T>(url, {
    headers: {
      "X-RapidAPI-Key": RAPID_KEY,
      "X-RapidAPI-Host": HOST,
    },
  });
}

function sportToParam(s: SportKey): "nba" | "nfl" {
  return s === "basketball_nba" ? "nba" : "nfl";
}

export const RapidApiOddsProvider: Provider = {
  name: "rapidapi:odds",
  async healthy() {
    if (!RAPID_KEY || !HOST) return false;
    try {
      // ping NBA as a canary
      await raFetch("/v1/odds?sport=nba");
      return true;
    } catch { return false; }
  },
  async getGames(sport: SportKey): Promise<Game[]> {
    const sp = sportToParam(sport);
    const data = await raFetch<any>(`/v1/odds?sport=${sp}`);
    // Normalize common shapes; fallback to empty
    const events = data?.events || data?.data || data || [];
    return (events as any[]).map((e) => ({
      id: String(e.id || e.event_id || e.game_id || `${e.away}_${e.home}_${e.start}`),
      sport,
      homeTeam: e.home || e.home_team || e.homeTeam,
      awayTeam: e.away || e.away_team || e.awayTeam,
      commenceTime: e.commence_time || e.start_time || e.commenceTime || new Date().toISOString(),
      markets: {},
    })).filter(g => g.homeTeam && g.awayTeam && g.id);
  },
  async getPropsForGame(sport: SportKey, gameId: string): Promise<Prop[]> {
    const sp = sportToParam(sport);
    const data = await raFetch<any>(`/v1/props?sport=${sp}&gameId=${encodeURIComponent(gameId)}`);
    const propsArr = data?.props || data?.data || data || [];
    const out: Prop[] = [];
    for (const p of propsArr as any[]) {
      out.push({
        id: String(p.id || `${p.market}:${p.player}:${p.book || "ra"}`),
        sport,
        gameId,
        gameLabel: `${p.away || p.awayTeam || ""} @ ${p.home || p.homeTeam || ""}`.trim(),
        player: p.player || p.name || "",
        market: p.market || p.type || "",
        line: typeof p.line === "number" ? p.line : (typeof p.point === "number" ? p.point : null),
        odds: Number(p.odds || p.price || 0),
        bookmaker: p.book || p.bookmaker || undefined,
        homeTeam: p.home || p.homeTeam || "",
        awayTeam: p.away || p.awayTeam || "",
      });
    }
    return out.filter(p => p.player && p.market);
  },
};
