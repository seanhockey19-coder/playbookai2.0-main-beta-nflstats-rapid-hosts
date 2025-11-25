"use client";

import { useEffect, useState } from "react";
import PlayerPhoto from "@/components/PlayerPhoto";
import TeamLogo from "@/components/TeamLogo";
import FavStar from "@/components/FavStar";
import Link from "next/link";

interface HotProp {
  id: string;
  sport: "nfl" | "nba";
  game: string;
  player: string;
  market: string;
  line: number | null;
  odds: number;
  implied: number;
  expected: number;
  edge: number;
  score: number;
}

export default function HotPropsPage() {
  const [data, setData] = useState<HotProp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/hot-props", { cache: "no-store" });
      if (res.ok) setData(await res.json());
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="text-sm text-slate-300">
        ← Back to Dashboard
      </Link>

      <h1 className="text-2xl font-semibold">Hot Props</h1>

      {loading ? (
        <div className="text-slate-400">Scanning props…</div>
      ) : (
        <div className="space-y-3">
          {data.map((p) => (
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
                          subtitle: `${p.market} ${p.line || ""}`,
                          link: "/dashboard/player-props",
                        },
                      }}
                    />
                  </div>
                  <div className="text-xs text-slate-400">{p.game}</div>
                </div>
              </div>

              <div className="text-right text-sm font-mono">
                <div className="text-emerald-400">
                  Edge: {(p.edge * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500">
                  Exp: {(p.expected * 100).toFixed(0)}% | Impl:{" "}
                  {(p.implied * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
