import { NextResponse } from "next/server";
import { getPropsAny } from "@/lib/oddsMulti";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const gameId = searchParams.get("gameId");
  if (!gameId) {
    return NextResponse.json({ error: "Missing required query param: gameId" }, { status: 400 });
  }
  try {
    const { provider, props, errors } = await getPropsAny("americanfootball_nfl", gameId);
    return NextResponse.json({ provider, props, errors });
  } catch (e: any) {
    console.error("[NFL/PROPS] error", e);
    return NextResponse.json({ error: "Failed to load NFL props", detail: e?.message }, { status: 502 });
  }
}
