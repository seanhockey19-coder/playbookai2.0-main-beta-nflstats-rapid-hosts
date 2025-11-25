// lib/fetchNBAProps.ts

export async function fetchNBAProps(gameId: string) {
  const API = process.env.ODDS_API_KEY;

  if (!API) return [];

  const url = `https://api.the-odds-api.com/v4/sports/basketball_nba/events/${gameId}/odds/?regions=us&markets=player_points,player_assists,player_rebounds,player_threes&oddsFormat=american&apiKey=${API}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];

  const data = await res.json();

  const markets = data.bookmakers?.[0]?.markets || [];

  // ⭐ FIX: Explicit type for props array so TypeScript stops complaining
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
        sport: "nba",
        player: o.description,
        team: "", // Odds API does not list team for player props
        market: m.key,
        line: o.point ?? null,
        odds: o.price,
        edge: 0, // You will compute this later with your model
        game: `${data.home_team} vs ${data.away_team}`,
      });
    }
  }

  return props;
}
