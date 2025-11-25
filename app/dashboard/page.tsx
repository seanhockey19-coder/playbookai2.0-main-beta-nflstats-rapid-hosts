"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TeamLogo from "@/components/TeamLogo";

type Sport = "nfl" | "nba";

interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  commence: string;
  markets: any[];
}

interface SnapshotPick {
  id: string;
  team: string; // bookmaker label
  favoriteTeamFull: string; // REAL full team name
  game: string;
  market: string;
  odds: number;
}

async function loadNFLGames(): Promise<Game[]> {
  const res = await fetch("/api/nfl/games", { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

async function loadNBAGames(): Promise<Game[]> {
  const res = await fetch("/api/nba/games", { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function DashboardPage() {
  const [sport, setSport] = useState<Sport>("nfl");
  const [nflGames, setNflGames] = useState<Game[]>([]);
  const [nbaGames, setNbaGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all games once
  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      const [nfl, nba] = await Promise.all([loadNFLGames(), loadNBAGames()]);
      setNflGames(nfl);
      setNbaGames(nba);
      setLoading(false);
    }
    loadAll();
  }, []);

  const games = sport === "nfl" ? nflGames : nbaGames;

  // AI Snapshot: clean team name fix
  const aiSnapshot: SnapshotPick[] = useMemo(() => {
    return games.slice(0, 3).flatMap((g) => {
      const h2h = g.markets?.find((m: any) => m.key === "h2h");
      if (!h2h || !h2h.outcomes?.length) return [];

      const favorite = h2h.outcomes.reduce((best: any, o: any) =>
        !best ? o : Math.abs(o.price) < Math.abs(best.price) ? o : best
      );

      const nameLower = favorite.name.toLowerCase();

      const fullTeam =
        nameLower.includes(g.homeTeam.toLowerCase()) ? g.homeTeam :
        nameLower.includes(g.awayTeam.toLowerCase()) ? g.awayTeam :
        favorite.name; // fallback

      return {
        id: `${g.id}-${favorite.name}`,
        team: favorite.name,
        favoriteTeamFull: fullTeam,
        game: `${g.awayTeam} @ ${g.homeTeam}`,
        market: "Moneyline",
        odds: favorite.price,
      };
    });
  }, [games]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-slate-400">
            Live NFL & NBA slate with quick AI insights.
          </p>
        </div>

        {/* SPORT SWITCH */}
        <div className="inline-flex items-center rounded-full bg-slate-900 p-1 text-xs font-medium">
          <button
            onClick={() => setSport("nfl")}
            className={`px-3 py-1 rounded-full ${
              sport === "nfl" ? "bg-sky-600 text-white" : "text-slate-300"
            }`}
          >
            NFL
          </button>
          <button
            onClick={() => setSport("nba")}
            className={`px-3 py-1 rounded-full ${
              sport === "nba" ? "bg-emerald-500 text-white" : "text-slate-300"
            }`}
          >
            NBA
          </button>
        </div>
      </div>

      {/* TOP: AI SNAPSHOT + QUICK LINKS */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
        {/* AI Snapshot Panel */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs uppercase text-slate-400">
                AI Picks Snapshot
              </div>
              <div className="text-sm text-slate-300">
                Favorite-side value picks based on current lines.
              </div>
            </div>

            <Link href="/dashboard/ai-picks" className="text-xs text-sky-400">
              View full →
            </Link>
          </div>

          {loading ? (
            <p className="text-slate-400 text-sm">Loading…</p>
          ) : aiSnapshot.length === 0 ? (
            <p className="text-slate-400 text-sm">No games found.</p>
          ) : (
            <div className="space-y-2">
              {aiSnapshot.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-md bg-slate-900/80 px-3 py-2 text-sm"
                >
                  <div>
                    <div className="font-semibold flex items-center gap-1.5">
                      <TeamLogo team={p.favoriteTeamFull} sport={sport} size={18} />
                      {p.favoriteTeamFull}
                    </div>
                    <div className="text-xs text-slate-400">{p.game}</div>
                  </div>

                  <div className="text-right text-xs">
                    <div className="font-mono">{p.odds}</div>
                    <div className="text-[10px] text-slate-500">Favorite</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* QUICK LINKS */}
        <div className="space-y-3">
          <Link
            href="/dashboard/player-props"
            className="block rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm hover:border-sky-600"
          >
            <div className="font-semibold">Player Props</div>
            <div className="text-xs text-slate-400">Browse live props by game.</div>
          </Link>

          <Link
            href="/dashboard/ladder-challenge"
            className="block rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm hover:border-sky-600"
          >
            <div className="font-semibold">Ladder Challenge</div>
            <div className="text-xs text-slate-400">
              Auto-build ladders from -500 to -1000 props.
            </div>
          </Link>

          <Link
            href="/dashboard/game-breakdown"
            className="block rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm hover:border-sky-600"
          >
            <div className="font-semibold">Game Breakdown</div>
            <div className="text-xs text-slate-400">
              Deep dive into spreads, totals & props.
            </div>
          </Link>
        </div>
      </div>

      {/* LIVE SLATE */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs uppercase text-slate-400">
            Live {sport.toUpperCase()} Slate
          </div>
          <div className="text-xs text-slate-500">
            {games.length} games loaded
          </div>
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm">Loading games…</p>
        ) : (
          <div className="space-y-2">
            {games.map((g) => {
              const h2h = g.markets?.find((m: any) => m.key === "h2h");

              return (
                <div
                  key={g.id}
                  className="rounded-lg bg-slate-900/80 px-3 py-2 text-sm flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      <TeamLogo team={g.awayTeam} sport={sport} size={20} />
                      {g.awayTeam}
                      <span className="text-slate-500 text-xs">@</span>
                      <TeamLogo team={g.homeTeam} sport={sport} size={20} />
                      {g.homeTeam}
                    </div>

                    <div className="text-xs text-slate-400">
                      {formatTime(g.commence)}
                    </div>
                  </div>

                  {/* Moneyline */}
                  {h2h && (
                    <div className="flex gap-3 text-xs text-slate-300 mt-1 sm:mt-0">
                      {h2h.outcomes?.map((o: any) => (
                        <div key={o.name} className="font-mono">
                          {o.name}: {o.price}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
