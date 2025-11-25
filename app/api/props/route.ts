// app/api/props/route.ts
import { NextResponse } from "next/server";

type Sport = "nfl" | "nba";

interface RawOddsProp {
  id: string;
  player: string;
  market: string;
  line: number;
  overOdds: number;
  underOdds: number;
  game: string;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sport = (searchParams.get("sport") as Sport) || "nfl";

  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    console.error("Missing ODDS_API_KEY env var");
    // Fallback props so UI still works
    const fallback: RawOddsProp[] =
      sport === "nfl"
        ? [
            {
              id: "allen-pass-yds",
              player: "Josh Allen",
              market: "passing_yards",
              line: 256.5,
              overOdds: -115,
              underOdds: -110,
              game: "Bills @ Dolphins",
            },
            {
              id: "barkley-rush-yds",
              player: "Saquon Barkley",
              market: "rushing_yards",
              line: 62.5,
              overOdds: -120,
              underOdds: +100,
              game: "Giants @ Eagles",
            },
          ]
        : [
            {
              id: "curry-pts",
              player: "Stephen Curry",
              market: "points",
              line: 28.5,
              overOdds: -120,
              underOdds: +100,
              game: "Warriors @ Suns",
            },
          ];

    return NextResponse.json({ sport, props: fallback });
  }

  try {
    // TODO: Replace this URL with your actual odds provider endpoint.
    // Example structure — adjust query params & paths to your provider:
    const res = await fetch(
      `https://YOUR_ODDS_API_BASE_URL/props?sport=${sport}&markets=player_props&apiKey=${apiKey}`,
      {
        next: { revalidate: 10 },
      }
    );

    if (!res.ok) {
      console.error("Odds API error", res.status);
      return NextResponse.json(
        { sport, props: [], error: "Failed to load props from provider" },
        { status: 500 }
      );
    }

    const json = await res.json();

    // TODO: Map provider response into RawOddsProp format above.
    // For now, we’ll just return json as-is so you can inspect it.
    return NextResponse.json({ sport, raw: json });
  } catch (err) {
    console.error("Error fetching props from Odds API", err);
    return NextResponse.json(
      { sport, props: [], error: "Error calling Odds API" },
      { status: 500 }
    );
  }
}
