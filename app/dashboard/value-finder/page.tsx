"use client";

import { useEffect, useState } from "react";
import PlayerPhoto from "@/components/PlayerPhoto";
import FavStar from "@/components/FavStar";
import Link from "next/link";

interface ValueProp {
  id: string;
  sport: "nfl" | "nba";
  game: string;
  homeTeam: string;
  awayTeam: string;
  player: string;
  market: string;
  line: number | null;
  odds: number;
  impliedProb: number;
  modelProb: number;
  edge: number;
  confidence: "low" | "medium" | "high";
  category: string;
  sortScore: number;
}

export default function ValueFinderPage() {
  const [allProps, setAllProps] = useState<ValueProp[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [sport, setSport] = useState("all");
  const [team, setTeam] = useState("all");
  const [market, setMarket] = useState("all");
  const [conf, setConf] = useState("all");
  const [minEdge, setMinEdge] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch("/api/value-finder", { cache: "no-store" });
      if (res.ok) setAllProps(await res.json());
      setLoading(false);
    }
    load();
  }, []);

  const filtered = allProps.filter((p) => {
    if (sport !== "all" && p.sport !== sport) return false;
    if (team !== "all" && !(p.homeTeam === team || p.awayTeam === team)) return false;
    if (market !== "all" && !p.market.includes(market)) return false;
    if (conf !== "all" && p.confidence !== conf) return false;
    if (p.edge * 100 < minEdge) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="text-sm text-slate-300">← Back to Dashboard</Link>

      <h1 className="text-2xl font-semibold">Value Finder</h1>
      <p className="text-sm text-slate-400">
        Search for all AI-rated value props across NFL & NBA.
      </p>

      {/* Filters */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <select value={sport} onChange={(e) => setSport(e.target.value)} className="input">
          <option value="all">All Sports</option>
          <option value="nfl">NFL</option>
          <option value="nba">NBA</option>
        </select>

        <select value={market} onChange={(e) => setMarket(e.target.value)} className="input">
          <option value="all">All Markets</option>
          <option value="rec">Receptions</option>
          <option value="rush">Rush Yards</option>
          <option value="pass">Pass Yards</option>
          <option value="points">Points</option>
          <option value="assists">Assists</option>
          <option value="rebounds">Rebounds</option>
        </select>

        <select value={conf} onChange={(e) => setConf(e.target.value)} className="input">
          <option value="all">All Confidence</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <input
          type="number"
          className="input"
          placeholder="Min Edge %"
          value={minEdge}
          onChange={(e) => setMinEdge(Number(e.target.value))}
        />
      </div>

      {loading ? (
        <div className="text-slate-400">Loading props…</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div key={p.id} className="rounded-lg bg-slate-900/60 border border-slate-800 px-4 py-3 flex justify-between">
              <div>
                <div className="flex items-center gap-2 font-semibold">
                  <PlayerPhoto name={p.player} size={30} />
                  {p.player}

                  <FavStar item={{
                    id: p.id,
                    type: "prop",
                    label: p.player,
                    extra: { subtitle: `${p.market} ${p.line}`, link: "/dashboard/value-finder" }
                  }} />
                </div>

                <div className="text-xs text-slate-400">{p.game}</div>
              </div>

              <div className="text-right font-mono text-xs">
                <div className="text-emerald-400">
                  Edge {(p.edge * 100).toFixed(1)}%
                </div>
                <div className="text-slate-400 text-[10px]">
                  Exp {(p.modelProb * 100).toFixed(0)}% · Impl {(p.impliedProb * 100).toFixed(0)}%
                </div>
                <div className="text-sky-400 text-[10px] mt-1">
                  {p.confidence} conf
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
