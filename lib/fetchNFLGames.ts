export async function fetchNFLGames() {
  const API = process.env.ODDS_API_KEY;

  if (!API) {
    console.error("❌ Missing ODDS_API_KEY");
    return [];
  }

  const url = `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?regions=us&markets=h2h,spreads,totals&oddsFormat=american&apiKey=${API}`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    console.error("Odds API error:", await res.text());
    return [];
  }

  const data = await res.json();

  return data.map((g: any) => ({
    id: g.id,
    game: `${g.home_team} vs ${g.away_team}`,
    homeTeam: g.home_team,
    awayTeam: g.away_team,
    commence: g.commence_time,
    markets: g.bookmakers?.[0]?.markets || [],
  }));
}
