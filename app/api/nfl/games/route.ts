import { NextResponse } from "next/server";
import { getGamesAny } from "@/lib/oddsMulti";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { provider, games, errors } = await getGamesAny("americanfootball_nfl");
    return NextResponse.json({ provider, games, errors });
  } catch (e: any) {
    console.error("[NFL/GAMES] error", e);
    return NextResponse.json(
      { error: "Failed to load NFL games", detail: e?.message },
      { status: 502 }
    );
  }
}
