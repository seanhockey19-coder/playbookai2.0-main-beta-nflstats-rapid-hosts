// app/api/ladder/route.ts
import { NextResponse } from "next/server";
import { computeEdge, categorizeMarket } from "@/lib/edgeModel";

const API = process.env.ODDS_API_KEY;

const CATEGORY_WEIGHTS: Record<string, number> = {
  receptions: 18,
  assists: 18,
  rebounds: 10,
  points: 4,
  yardage: 2,
  threes: 0,
  touchdown: -10,
  other: 0,
};

export async function GET() {
  if (!API) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  const sports = [
    { key: "nfl" as const, path: "americanfootball_nfl" },
    { key: "nba" as const, path: "basketball_nba" },
  ];

  let props: any[] = [];

  for (const s of sports) {
    const gamesRes = await fetch(
      `https://api.the-odds-api.com/v4/sports/${s.path}/odds/?regions=us&markets=h2h&apiKey=${API}`,
      { cache: "no-store" }
    );
    if (!gamesRes.ok) continue;
    const games = await gamesRes.json();

    for (const g of games) {
      const propsRes = await fetch(
        `https://api.the-odds-api.com/v4/sports/${s.path}/events/${g.id}/odds/?regions=us&markets=player_pass_yds,player_rush_yds,player_rec_yds,player_receptions,player_points,player_assists,player_rebounds,player_threes,player_anytime_td&apiKey=${API}`,
        { cache: "no-store" }
      );
      if (!propsRes.ok) continue;
      const event = await propsRes.json();

      const markets = event.bookmakers?.[0]?.markets || [];

      for (const m of markets) {
        for (const o of m.outcomes) {
          // RUN MODEL
          const edgeRes = computeEdge({
            sport: s.key,
            marketKey: m.key,
            line: o.point ?? null,
            odds: o.price,
            player: o.description,
            game: `${event.home_team} @ ${event.away_team}`,
          });

          // ODDS FILTER: -500 to -1000
          if (o.price > -500 || o.price < -1000) continue;

          // EDGE FILTER: positive EV only
          if (edgeRes.edge < 0) continue;

          // CATEGORY
          const cat = categorizeMarket(m.key);
          const catScore = CATEGORY_WEIGHTS[cat] ?? 0;

          // LADDER SCORE
          const ladderScore =
            edgeRes.modelProb * 100 +
            edgeRes.edge * 200 +
            catScore;

          props.push({
            id: `${event.id}-${m.key}-${o.description}`,
            sport: s.key,
            player: o.description,
            game: `${event.home_team} @ ${event.away_team}`,
            market: m.key,
            line: o.point ?? null,
            odds: o.price,
            implied: edgeRes.impliedProb,
            expected: edgeRes.modelProb,
            edge: edgeRes.edge,
            confidence: edgeRes.confidence,
            category: cat,
            catScore,
            ladderScore,
          });
        }
      }
    }
  }

  // SORT BEST FOR LADDER
  props.sort((a, b) => b.ladderScore - a.ladderScore);

  // RETURN BEST 4–6 LEGS
  return NextResponse.json(props.slice(0, 6));
}
