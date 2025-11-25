import { NextResponse } from "next/server";
import { getOddsApiScores } from "@/lib/rapidapi";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fixtureId = searchParams.get("fixtureId");

  if (!fixtureId) {
    return NextResponse.json(
      { error: "Missing fixtureId query parameter" },
      { status: 400 }
    );
  }

  try {
    const data = await getOddsApiScores(fixtureId);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch scores", details: err.message },
      { status: 500 }
    );
  }
}
