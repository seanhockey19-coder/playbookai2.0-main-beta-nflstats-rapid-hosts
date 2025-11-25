import { NextResponse } from "next/server";
import { computeGameScript } from "@/lib/gameScriptModel";

const API = process.env.ODDS_API_KEY;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const gameId = searchParams.get("gameId");
  const sport = searchParams.get("sport") as "nfl" | "nba";

  if (!gameId || !sport) {
    return NextResponse.json({ error: "Missing gameId or sport" }, { status: 400 });
  }

  const sportsMap = {
    nfl: "americanfootball_nfl",
    nba: "basketball_nba",
  };

  const url = `https://api.the-odds-api.com/v4/sports/${sportsMap[sport]}/events/${gameId}/odds/?regions=us&markets=h2h,totals,spreads&apiKey=${API}`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const data = await res.json();

  const home = data.home_team;
  const away = data.away_team;

  // extract spread & total
  const h2h = data.bookmakers?.[0]?.markets?.find((m: any) => m.key === "h2h");
  const spreads = data.bookmakers?.[0]?.markets?.find((m: any) => m.key === "spreads");
  const totals = data.bookmakers?.[0]?.markets?.find((m: any) => m.key === "totals");

  let spread = null;
  let total = null;

  if (spreads && spreads.outcomes?.length >= 2) {
    const homeOutcome = spreads.outcomes.find((o: any) => o.name === home);
    if (homeOutcome) spread = homeOutcome.point;
  }

  if (totals && totals.outcomes?.length === 2) {
    const over = totals.outcomes.find((o: any) => o.name === "Over");
    if (over) total = over.point;
  }

  const script = computeGameScript({
    sport,
    homeTeam: home,
    awayTeam: away,
    spread,
    total,
  });

  return NextResponse.json(script);
}
