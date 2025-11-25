import { NextResponse } from "next/server";
import { computeEdge, categorizeMarket } from "@/lib/edgeModel";

const API = process.env.ODDS_API_KEY;

const SPORTS = [
  { key: "nfl", path: "americanfootball_nfl" },
  { key: "nba", path: "basketball_nba" },
];

// What markets to fetch
const MARKETS =
  "player_pass_yds,player_rush_yds,player_rec_yds,player_receptions,player_points,player_assists,player_rebounds,player_threes,player_anytime_td";

export async function GET() {
  if (!API) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  let results: any[] = [];

  for (const s of SPORTS) {
    // Step 1: Get games
    const gamesRes = await fetch(
      `https://api.the-odds-api.com/v4/sports/${s.path}/odds/?regions=us&markets=h2h&apiKey=${API}`,
      { cache: "no-store" }
    );
    if (!gamesRes.ok) continue;
    const games = await gamesRes.json();

    // Step 2: Loop through games
    for (const g of games) {
      const propsRes = await fetch(
        `https://api.the-odds-api.com/v4/sports/${s.path}/events/${g.id}/odds/?regions=us&markets=${MARKETS}&apiKey=${API}`,
        { cache: "no-store" }
      );

      if (!propsRes.ok) continue;
      const event = await propsRes.json();

      const markets = event.bookmakers?.[0]?.markets || [];

      // Step 3: Loop through props
      for (const m of markets) {
        for (const o of m.outcomes) {
          const edgeStats = computeEdge({
            sport: s.key as "nfl" | "nba",
            marketKey: m.key,
            line: o.point ?? null,
            odds: o.price,
            player: o.description,
            game: `${event.home_team} @ ${event.away_team}`,
          });

          const marketCat = categorizeMarket(m.key);

          results.push({
            id: `${event.id}-${m.key}-${o.description}`,
            sport: s.key,
            game: `${event.home_team} @ ${event.away_team}`,
            homeTeam: event.home_team,
            awayTeam: event.away_team,
            player: o.description,
            market: m.key,
            line: o.point ?? null,
            odds: o.price,
            impliedProb: edgeStats.impliedProb,
            modelProb: edgeStats.modelProb,
            edge: edgeStats.edge,
            confidence: edgeStats.confidence,
            category: marketCat,
            sortScore: edgeStats.edge * 100 + (marketCat === "receptions" ? 10 : 0),
          });
        }
      }
    }
  }

  // Sort best → worst
  results.sort((a, b) => b.sortScore - a.sortScore);

  return NextResponse.json(results);
}
