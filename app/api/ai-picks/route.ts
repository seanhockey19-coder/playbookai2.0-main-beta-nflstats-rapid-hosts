// app/api/ai-picks/route.ts
import { NextResponse } from "next/server";
import { computeEdge } from "@/lib/edgeModel";

const API = process.env.ODDS_API_KEY;

export async function GET() {
  if (!API) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  const sports = [
    { key: "nfl" as const, path: "americanfootball_nfl" },
    { key: "nba" as const, path: "basketball_nba" },
  ];

  let picks: any[] = [];

  for (const s of sports) {
    const gamesRes = await fetch(
      `https://api.the-odds-api.com/v4/sports/${s.path}/odds/?regions=us&markets=h2h&apiKey=${API}`,
      { cache: "no-store" }
    );

    if (!gamesRes.ok) continue;
    const games = await gamesRes.json();

    // Limit work: sample first few games per sport
    const sampleGames = games.slice(0, 4);

    for (const g of sampleGames) {
      const propsRes = await fetch(
        `https://api.the-odds-api.com/v4/sports/${s.path}/events/${g.id}/odds/?regions=us&markets=player_pass_yds,player_rush_yds,player_rec_yds,player_receptions,player_points,player_assists,player_rebounds,player_threes,player_anytime_td&apiKey=${API}`,
        { cache: "no-store" }
      );

      if (!propsRes.ok) continue;
      const event = await propsRes.json();
      const markets = event.bookmakers?.[0]?.markets || [];

      for (const m of markets) {
        for (const o of m.outcomes) {
          const edgeRes = computeEdge({
            sport: s.key,
            marketKey: m.key,
            line: o.point ?? null,
            odds: o.price,
            player: o.description,
            game: `${event.home_team} @ ${event.away_team}`,
          });

          // filter for decent favorite-ish odds (ladder-friendly style)
          if (o.price <= -120 && o.price >= -900) {
            picks.push({
              id: `${event.id}-${m.key}-${o.description}`,
              sport: s.key,
              game: `${event.home_team} @ ${event.away_team}`,
              player: o.description,
              market: m.key,
              line: o.point ?? null,
              odds: o.price,
              implied: edgeRes.impliedProb,
              expected: edgeRes.modelProb,
              edge: edgeRes.edge,
              confidence: edgeRes.confidence,
              notes: edgeRes.notes,
              category: edgeRes.category,
            });
          }
        }
      }
    }
  }

  // Rank by edge & confidence
  picks.sort((a, b) => b.edge - a.edge);

  return NextResponse.json(picks.slice(0, 40));
}
