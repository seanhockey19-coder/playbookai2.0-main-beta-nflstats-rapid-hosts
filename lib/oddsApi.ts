import { fetchJson } from "./http";
import type { Game, Prop, SportKey } from "./types";

const ODDS_KEY = process.env.ODDS_API_KEY;
if (!ODDS_KEY) console.warn("ODDS_API_KEY is not set. API routes will fail.");

const BASE = "https://api.the-odds-api.com/v4";
const REGION = process.env.ODDS_API_REGION ?? "us";
const FORMAT = process.env.ODDS_API_FORMAT ?? "american";

const GAME_MARKETS = "h2h,spreads,totals";
const NFL_PROP_MARKETS =
  "player_pass_yds,player_rush_yds,player_rec_yds,player_receptions,player_anytime_td";
const NBA_PROP_MARKETS =
  "player_points,player_rebounds,player_assists,player_threes,player_points_rebounds_assists";

type RawEvent = {
  id: string;
  home_team: string;
  away_team: string;
  commence_time: string;
  bookmakers?: Array<{ key: string; title: string; markets: Array<{ key: string; outcomes?: any[] }> }>;
};

type RawEventWithMarkets = RawEvent & {
  bookmakers: Array<{
    key: string;
    title: string;
    markets: Array<{
      key: string;
      outcomes?: Array<{ name: string; price: number; point?: number; description?: string }>;
    }>;
  }>;
};

function labelGame(away: string, home: string) {
  return `${away} @ ${home}`;
}

export async function getGames(sport: SportKey): Promise<Game[]> {
  if (!ODDS_KEY) return [];
  const url =
    `${BASE}/sports/${sport}/odds` +
    `?regions=${encodeURIComponent(REGION)}` +
    `&markets=${encodeURIComponent(GAME_MARKETS)}` +
    `&oddsFormat=${encodeURIComponent(FORMAT)}` +
    `&apiKey=${encodeURIComponent(ODDS_KEY)}`;

  const data = await fetchJson<RawEvent[]>(url);
  return (data ?? []).map((e) => ({
    id: e.id,
    sport,
    homeTeam: e.home_team,
    awayTeam: e.away_team,
    commenceTime: e.commence_time,
    markets:
      e.bookmakers?.[0]?.markets?.reduce<Record<string, unknown>>((acc, m) => {
        acc[m.key] = m;
        return acc;
      }, {}) ?? {},
  }));
}

export async function getPropsForGame(sport: SportKey, gameId: string): Promise<Prop[]> {
  if (!ODDS_KEY) return [];
  const markets = sport === "americanfootball_nfl" ? NFL_PROP_MARKETS : NBA_PROP_MARKETS;

  const url =
    `${BASE}/sports/${sport}/events/${encodeURIComponent(gameId)}/odds` +
    `?regions=${encodeURIComponent(REGION)}` +
    `&markets=${encodeURIComponent(markets)}` +
    `&oddsFormat=${encodeURIComponent(FORMAT)}` +
    `&apiKey=${encodeURIComponent(ODDS_KEY)}`;

  const e = await fetchJson<RawEventWithMarkets>(url);
  if (!e || !e.bookmakers?.length) return [];

  const home = e.home_team;
  const away = e.away_team;
  const gameLabel = labelGame(away, home);

  const props: Prop[] = [];
  for (const book of e.bookmakers) {
    for (const m of book.markets ?? []) {
      for (const o of m.outcomes ?? []) {
        const player = (o.description && o.description.trim()) || (o.name && o.name.trim()) || "";
        if (!player) continue;
        props.push({
          id: `${m.key}:${player}:${book.key}`,
          sport,
          gameId: e.id,
          gameLabel,
          player,
          market: m.key,
          line: o.point ?? null,
          odds: o.price,
          bookmaker: book.title || book.key,
          homeTeam: home,
          awayTeam: away,
        });
      }
    }
  }
  return props;
}
