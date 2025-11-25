// lib/fetchNFLProps.ts

export async function fetchNFLProps(gameId: string) {
  const API = process.env.ODDS_API_KEY;

  if (!API) return [];

  const url = `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/events/${gameId}/odds/?regions=us&markets=player_pass_yds,player_rush_yds,player_rec_yds,player_receptions,player_anytime_td&oddsFormat=american&apiKey=${API}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];

  const data = await res.json();

  const markets = data.bookmakers?.[0]?.markets || [];

  // ⭐ FIX: Explicit type for props array
  const props: {
    id: string;
    sport: string;
    player: string;
    team: string;
    market: string;
    line: number | null;
    odds: number;
    edge: number;
    game: string;
  }[] = [];

  for (const m of markets) {
    for (const o of m.outcomes) {
      props.push({
        id: `${data.id}-${m.key}-${o.description}`,
        sport: "nfl",
        player: o.description,
        team: "", // team not provided on props endpoint
        market: m.key,
        line: o.point ?? null,
        odds: o.price,
        edge: 0,
        game: `${data.home_team} vs ${data.away_team}`,
      });
    }
  }

  return props;
}
