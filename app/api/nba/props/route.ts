import { NextResponse } from "next/server";
import { getPropsAny } from "@/lib/oddsMulti";
import { RapidApiApiBasketballProvider } from "@/lib/providers/rapidapiApiBasketball";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const gameId = searchParams.get("gameId");   // our internal/The Odds API game id
  const raGameId = searchParams.get("raGameId"); // api-basketball game id
  if (!gameId && !raGameId) {
    return NextResponse.json({ error: "Missing gameId or raGameId" }, { status: 400 });
  }
  try {
    if (raGameId) {
      // Force api-basketball provider when raGameId is provided
      const props = await RapidApiApiBasketballProvider.getPropsForGame("basketball_nba", raGameId);
      return NextResponse.json({ provider: "rapidapi:api-basketball", props, errors: [] });
    }
    const { provider, props, errors } = await getPropsAny("basketball_nba", gameId as string);
    return NextResponse.json({ provider, props, errors });
  } catch (e: any) {
    console.error("[NBA/PROPS] error", e);
    return NextResponse.json({ error: "Failed to load NBA props", detail: e?.message }, { status: 502 });
  }
}
