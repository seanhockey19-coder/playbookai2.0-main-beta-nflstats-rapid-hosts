"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PlayerPhoto from "@/components/PlayerPhoto";
import FavStar from "@/components/FavStar";

interface AIPick {
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
  confidence: "low" | "medium" | "high";
  notes: string;
  category: string;
}

export default function AIPicksPage() {
  const [picks, setPicks] = useState<AIPick[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState<"all" | "nfl" | "nba">("all");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch("/api/ai-picks", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPicks(data);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(
    () =>
      sportFilter === "all"
        ? picks
        : picks.filter((p) => p.sport === sportFilter),
    [picks, sportFilter]
  );

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="inline-flex text-sm text-slate-300">
        ← Back to Dashboard
      </Link>

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">AI Picks</h1>
          <p className="text-sm text-slate-400">
            Ranked by model edge: comparing expected hit rate vs market implied probability.
          </p>
        </div>

        <div className="inline-flex items-center rounded-full bg-slate-900 p-1 text-xs font-medium">
          <button
            onClick={() => setSportFilter("all")}
            className={`px-3 py-1 rounded-full ${
              sportFilter === "all" ? "bg-slate-700 text-white" : "text-slate-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSportFilter("nfl")}
            className={`px-3 py-1 rounded-full ${
              sportFilter === "nfl" ? "bg-sky-600 text-white" : "text-slate-300"
            }`}
          >
            NFL
          </button>
          <button
            onClick={() => setSportFilter("nba")}
            className={`px-3 py-1 rounded-full ${
              sportFilter === "nba" ? "bg-emerald-500 text-white" : "text-slate-300"
            }`}
          >
            NBA
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-slate-400">Scanning live props for model edges…</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-slate-400">No picks matched the current filters.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3"
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
                          link: "/dashboard/ai-picks",
                        },
                      }}
                    />
                  </div>
                  <div className="text-xs text-slate-400">{p.game}</div>
                  <div className="text-[10px] text-slate-500 capitalize">
                    {p.category.replace("_", " ")} · {p.notes}
                  </div>
                </div>
              </div>

              <div className="text-right text-xs font-mono">
                <div className="text-slate-100">
                  {p.odds > 0 ? "+" : ""}
                  {p.odds}
                </div>
                <div className="text-emerald-400">
                  Edge {(p.edge * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-500">
                  Exp {(p.expected * 100).toFixed(0)}% · Impl{" "}
                  {(p.implied * 100).toFixed(0)}%
                </div>
                <div
                  className={`mt-1 text-[10px] uppercase tracking-wide ${
                    p.confidence === "high"
                      ? "text-emerald-400"
                      : p.confidence === "medium"
                      ? "text-amber-300"
                      : "text-slate-500"
                  }`}
                >
                  {p.confidence} confidence
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
