import { NextRequest, NextResponse } from "next/server";
import { getNflPlayerStats } from "@/lib/rapidapi";
import { buildPlayerSummary } from "@/lib/nflStatsEngine";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idParam = searchParams.get("id");
  const yearParam = searchParams.get("year");

  if (!idParam || !yearParam) {
    return NextResponse.json(
      { error: "Missing required query params: id, year" },
      { status: 400 }
    );
  }

  const athleteId: string | number =
    /^[0-9]+$/.test(idParam) ? parseInt(idParam, 10) : idParam;
  const season = parseInt(yearParam, 10);

  try {
    const raw = await getNflPlayerStats(athleteId, season);
    const summary = buildPlayerSummary(athleteId, season, raw);
    return NextResponse.json({ summary });
  } catch (err: any) {
    console.error("Error in /api/nfl/player-insights:", err);
    return NextResponse.json(
      {
        error: "Failed to fetch or parse player statistics from NFL API Data",
        details: err.message ?? String(err),
      },
      { status: 500 }
    );
  }
}
