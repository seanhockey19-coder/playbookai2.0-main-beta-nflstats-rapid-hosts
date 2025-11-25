import { fetchJson } from "@/lib/http";
import type { Provider } from "./index";
import type { SportKey, Game, Prop } from "@/lib/types";

const RAPID_KEY = process.env.RAPIDAPI_KEY;
const HOST = process.env.RAPIDAPI_NFL_HOST || "";

async function raFetch<T>(path: string): Promise<T> {
  if (!RAPID_KEY || !HOST) throw new Error("RapidAPI NFL not configured");
  const url = `https://${HOST}${path}`;
  return fetchJson<T>(url, {
    headers: {
      "X-RapidAPI-Key": RAPID_KEY,
      "X-RapidAPI-Host": HOST,
    },
  });
}

export const RapidApiNflProvider: Provider = {
  name: "rapidapi:nfl",
  async healthy() {
    if (!RAPID_KEY || !HOST) return false;
    try {
      await raFetch("/v1/games"); // placeholder path
      return true;
    } catch { return false; }
  },
  async getGames(sport: SportKey): Promise<Game[]> {
    if (sport !== "americanfootball_nfl") return [];
    const data = await raFetch<any>("/v1/games");
    const events = data?.events || data?.data || data || [];
    return (events as any[]).map((e) => ({
      id: String(e.id || e.game_id || `${e.away}_${e.home}_${e.start}`),
      sport,
      homeTeam: e.home || e.home_team || e.homeTeam,
      awayTeam: e.away || e.away_team || e.awayTeam,
      commenceTime: e.commence_time || e.start_time || new Date().toISOString(),
      markets: {},
    })).filter(g => g.homeTeam && g.awayTeam && g.id);
  },
  async getPropsForGame(sport: SportKey, gameId: string): Promise<Prop[]> {
    if (sport !== "americanfootball_nfl") return [];
    const data = await raFetch<any>(`/v1/props?gameId=${encodeURIComponent(gameId)}`);
    const rows = data?.props || data?.data || data || [];
    return (rows as any[]).map((p) => ({
      id: String(p.id || `${p.market}:${p.player}:${p.book || "ra-nfl"}`),
      sport,
      gameId,
      gameLabel: `${p.away || ""} @ ${p.home || ""}`.trim(),
      player: p.player || p.name || "",
      market: p.market || p.type || "",
      line: typeof p.line === "number" ? p.line : (typeof p.point === "number" ? p.point : null),
      odds: Number(p.odds || p.price || 0),
      bookmaker: p.book || p.bookmaker || undefined,
      homeTeam: p.home || "",
      awayTeam: p.away || "",
    })).filter(p => p.player && p.market);
  },
};
