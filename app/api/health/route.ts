import { NextResponse } from "next/server";
import { OddsApiProvider } from "@/lib/providers/oddsapi";
import { RapidApiOddsProvider } from "@/lib/providers/rapidapiOdds";
import { RapidApiNflProvider } from "@/lib/providers/rapidapiNfl";
import { RapidApiNbaProvider } from "@/lib/providers/rapidapiNba";
import { getGamesAny } from "@/lib/oddsMulti";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = await Promise.all([
    OddsApiProvider.healthy?.().catch(()=>false),
    RapidApiOddsProvider.healthy?.().catch(()=>false),
    RapidApiNflProvider.healthy?.().catch(()=>false),
    RapidApiNbaProvider.healthy?.().catch(()=>false),
  ]);

  let nflCount = 0, nbaCount = 0, nflProv = "none", nbaProv = "none";
  try {
    const g1 = await getGamesAny("americanfootball_nfl");
    nflCount = g1.games.length; nflProv = g1.provider;
  } catch {}
  try {
    const g2 = await getGamesAny("basketball_nba");
    nbaCount = g2.games.length; nbaProv = g2.provider;
  } catch {}

  return NextResponse.json({
    providers: {
      oddsapi: !!checks[0],
      rapidapi_odds: !!checks[1],
      rapidapi_nfl: !!checks[2],
      rapidapi_nba: !!checks[3],
    },
    snapshot: {
      nfl: { provider: nflProv, count: nflCount },
      nba: { provider: nbaProv, count: nbaCount },
    }
  });
}
