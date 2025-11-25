"use client";

import { useEffect, useState } from "react";
import PlayerPhoto from "@/components/PlayerPhoto";
import FavStar from "@/components/FavStar";
import Link from "next/link";

interface LadderLeg {
  id: string;
  sport: "nfl" | "nba";
  player: string;
  game: string;
  market: string;
  line: number | null;
  odds: number;
  implied: number;
  expected: number;
  edge: number;
  confidence: "low" | "medium" | "high";
  category: string;
  ladderScore: number;
}

export default function LadderChallengePage() {
  const [legs, setLegs] = useState<LadderLeg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch("/api/ladder", { cache: "no-store" });
      if (res.ok) setLegs(await res.json());
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="text-sm text-slate-300">
        ← Back to Dashboard
      </Link>

      <h1 className="text-2xl font-semibold">Ladder Challenge (AI Powered)</h1>

      <p className="text-slate-400 text-sm">
        These legs are filtered for odds -500 to -1000 and ranked by AI edge,
        category safety, and true probability.
      </p>

      {loading ? (
        <div className="text-slate-400">Building ladder…</div>
      ) : legs.length === 0 ? (
        <div className="text-slate-400">No suitable props available right now.</div>
      ) : (
        <div className="space-y-3">
          {legs.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <PlayerPhoto name={p.player} size={34} />
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    {p.player}
                    <FavStar
                      item={{
                        id: p.id,
                        type: "prop",
                        label: p.player,
                        extra: {
                          subtitle: `${p.market} ${p.line ?? ""}`,
                          link: "/dashboard/ladder-challenge",
                        },
                      }}
                    />
                  </div>
                  <div className="text-xs text-slate-400">{p.game}</div>
                  <div className="text-[10px] text-slate-500">
                    {p.category} · {p.confidence} confidence
                  </div>
                </div>
              </div>

              <div className="text-right text-xs font-mono">
                <div className="text-slate-100">{p.odds}</div>
                <div className="text-emerald-400">
                  Edge {(p.edge * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-500">
                  Exp {(p.expected * 100).toFixed(0)}% · Impl{" "}
                  {(p.implied * 100).toFixed(0)}%
                </div>
                <div className="text-[10px] text-cyan-400 mt-1">
                  Score {p.ladderScore.toFixed(1)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
