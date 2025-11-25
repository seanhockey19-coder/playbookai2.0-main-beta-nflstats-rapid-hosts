"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TeamLogo from "@/components/TeamLogo";
import PlayerPhoto from "@/components/PlayerPhoto";

interface TrendingProp {
  id: string;
  sport: "nfl" | "nba";
  game: string;
  player: string;
  market: string;
  line: number | null;
  odds: number;
  oddsMove: number;
  lineMove: number;
}

export default function TrendingPropsPage() {
  const [loading, setLoading] = useState(true);
  const [props, setProps] = useState<TrendingProp[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch("/api/trending-props", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setProps(data);
      }
      setLoading(false);
    }

    load();
    const interval = setInterval(load, 1000 * 60 * 2);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm text-slate-300"
      >
        ← Back to Dashboard
      </Link>

      <h1 className="text-2xl font-semibold">
        Trending Props (Live Movement)
      </h1>
      <p className="text-slate-400 text-sm">
        Updated every 3 minutes · Odds & line movement based on live props
      </p>

      {loading ? (
        <div className="text-slate-400">Loading trending props…</div>
      ) : props.length === 0 ? (
        <div className="text-slate-400">No significant movement yet.</div>
      ) : (
        <div className="space-y-3">
          {props.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg bg-slate-900/80 border border-slate-800 px-4 py-3"
            >
              {/* Player */}
              <div className="flex items-center gap-3">
                <PlayerPhoto name={p.player} size={32} />

                <div>
                  <div className="font-semibold flex items-center gap-1.5">
                    {p.player}
                  </div>
                  <div className="text-xs text-slate-400">{p.game}</div>
                </div>
              </div>

              {/* Market */}
              <div className="text-xs text-slate-400 capitalize">
                {p.market.replace("player_", "").replace(/_/g, " ")}
                {p.line !== null ? ` · ${p.line}` : ""}
              </div>

              {/* MOVEMENT */}
              <div className="text-right text-sm">
                <div
                  className={`font-mono ${
                    p.oddsMove < 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {p.oddsMove > 0 ? "+" : ""}
                  {p.oddsMove}
                </div>

                {p.lineMove !== 0 && (
                  <div
                    className={`text-xs ${
                      p.lineMove > 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {p.lineMove > 0 ? "+" : ""}
                    {p.lineMove} line
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
