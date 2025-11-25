import { NextResponse } from "next/server";
import { getBasketballOdds } from "@/lib/rapidapi";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get("gameId");

  if (!gameId) {
    return NextResponse.json(
      { error: "Missing gameId query parameter" },
      { status: 400 }
    );
  }

  try {
    const data = await getBasketballOdds(gameId);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch basketball odds", details: err.message },
      { status: 500 }
    );
  }
}
