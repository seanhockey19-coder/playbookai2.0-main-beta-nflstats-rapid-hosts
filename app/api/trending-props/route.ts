// app/api/trending-props/route.ts
import { NextResponse } from "next/server";

let cachedProps: any[] = [];
let lastUpdate = 0;

const CACHE_WINDOW = 1000 * 60 * 3; // 3 minutes

async function fetchAllProps() {
  const sports = [
    { key: "nfl", path: "americanfootball_nfl" },
    { key: "nba", path: "basketball_nba" },
  ];

  const API = process.env.ODDS_API_KEY;
  if (!API) return [];

  let props: any[] = [];

  for (const s of sports) {
    const gamesURL = `https://api.the-odds-api.com/v4/sports/${s.path}/odds/?regions=us&markets=h2h&apiKey=${API}`;
    const gamesRes = await fetch(gamesURL, { cache: "no-store" });

    if (!gamesRes.ok) continue;
    const games = await gamesRes.json();

    for (const g of games) {
      const propsURL = `https://api.the-odds-api.com/v4/sports/${s.path}/events/${g.id}/odds/?regions=us&markets=player_pass_yds,player_rush_yds,player_rec_yds,player_receptions,player_anytime_td,player_points,player_assists,player_rebounds,player_threes&apiKey=${API}`;
      const propsRes = await fetch(propsURL, { cache: "no-store" });

      if (!propsRes.ok) continue;
      const data = await propsRes.json();

      const markets = data.bookmakers?.[0]?.markets || [];

      for (const m of markets) {
        for (const o of m.outcomes) {
          props.push({
            id: `${data.id}-${m.key}-${o.description}`,
            sport: s.key,
            game: `${data.home_team} @ ${data.away_team}`,
            player: o.description,
            market: m.key,
            line: o.point ?? null,
            odds: o.price,
          });
        }
      }
    }
  }

  return props;
}

export async function GET() {
  const now = Date.now();

  const freshProps = await fetchAllProps();

  // On first run, just cache everything
  if (!cachedProps.length) {
    cachedProps = freshProps;
    lastUpdate = now;
  }

  // Compare props to cached version
  const movements: any[] = [];

  for (const p of freshProps) {
    const old = cachedProps.find((x) => x.id === p.id);
    if (!old) continue;

    const oddsMove = p.odds - old.odds;
    const lineMove =
      p.line !== null && old.line !== null ? p.line - old.line : 0;

    if (Math.abs(oddsMove) >= 15 || Math.abs(lineMove) >= 0.5) {
      movements.push({
        ...p,
        oddsMove,
        lineMove,
        score:
          Math.abs(oddsMove) * 1.2 + Math.abs(lineMove) * 20, // ranking score
      });
    }
  }

  // Sort hottest props
  movements.sort((a, b) => b.score - a.score);

  // Update cache if outside window
  if (now - lastUpdate > CACHE_WINDOW) {
    cachedProps = freshProps;
    lastUpdate = now;
  }

  return NextResponse.json(movements.slice(0, 40));
}
