// app/dashboard/player-props/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PlayerProp {
  id: string;
  player: string;
  team: string;
  market: string;
  line: number | null;
  odds: number;
  edge: number;
  game: string;
  sport: string;
}

interface GameOption {
  id: string;
  label: string;
}

// -----------------------
// API CALLS (LIVE DATA)
// -----------------------

async function loadNFLGames() {
  const res = await fetch("/api/nfl/games", { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

async function loadNFLProps(gameId: string) {
  const res = await fetch(`/api/nfl/props?gameId=${gameId}`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

async function loadNBAGames() {
  const res = await fetch("/api/nba/games", { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

async function loadNBAProps(gameId: string) {
  const res = await fetch(`/api/nba/props?gameId=${gameId}`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

// ------------------------------------------------------------
// MAIN COMPONENT – LIVE PLAYER PROPS UI
// ------------------------------------------------------------
export default function PlayerPropsPage() {
  const [sport, setSport] = useState<"nfl" | "nba">("nfl");
  const [games, setGames] = useState<GameOption[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string>("");
  const [props, setProps] = useState<PlayerProp[]>([]);
  const [search, setSearch] = useState("");

  // Load games when sport changes
  useEffect(() => {
    async function fetchGames() {
      if (sport === "nfl") {
        const g = await loadNFLGames();
        const formatted = g.map((x: any) => ({
          id: x.id,
          label: `${x.homeTeam} vs ${x.awayTeam}`,
        }));
        setGames(formatted);
        setSelectedGameId(formatted[0]?.id ?? "");
      } else {
        const g = await loadNBAGames();
        const formatted = g.map((x: any) => ({
          id: x.id,
          label: `${x.homeTeam} vs ${x.awayTeam}`,
        }));
        setGames(formatted);
        setSelectedGameId(formatted[0]?.id ?? "");
      }
    }

    fetchGames();
  }, [sport]);

  // Load props whenever a game changes
  useEffect(() => {
    async function fetchProps() {
      if (!selectedGameId) return;

      if (sport === "nfl") {
        const p = await loadNFLProps(selectedGameId);
        setProps(p);
      } else {
        const p = await loadNBAProps(selectedGameId);
        setProps(p);
      }
    }

    fetchProps();
  }, [selectedGameId, sport]);

  const filtered = props
    .filter((p) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        p.player.toLowerCase().includes(q) ||
        p.team.toLowerCase().includes(q) ||
        p.market.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => b.edge - a.edge);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-slate-300 hover:text-slate-100 mb-2"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Player Props</h1>
          <p className="text-sm text-slate-400">
            Live props pulled from The Odds API. Filter by sport, game, and player.
          </p>
        </div>

        {/* Sport toggle */}
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

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          {/* Game dropdown */}
          <select
            value={selectedGameId}
            onChange={(e) => setSelectedGameId(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100"
          >
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>

          <div className="text-xs text-slate-400">
            Showing {filtered.length} props for this game
          </div>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search player, team, or market..."
          className="w-full sm:w-72 rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-500"
        />
      </div>

      {/* Props list */}
      <div className="space-y-3">
        {filtered.map((prop) => (
          <div
            key={prop.id}
            className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-sm flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-0.5">
              <div className="font-semibold">
                {prop.player}{" "}
                <span className="text-xs text-slate-400">({prop.team})</span>
              </div>
              <div className="text-xs text-slate-400">
                {prop.market.replace("player_", "").replace(/_/g, " ")} ·{" "}
                {prop.line ?? "N/A"}
              </div>
              <div className="text-[11px] text-slate-500">{prop.game}</div>
            </div>

            <div className="text-right space-y-1">
              <div className="font-mono text-xs text-slate-100">
                {prop.odds > 0 ? "+" : ""}
                {prop.odds}
              </div>
              <div className="text-xs text-emerald-400">
                Edge {prop.edge.toFixed(1)}%
              </div>
              <div className="text-[10px] uppercase tracking-wide text-slate-500">
                Edge = model probability − market implied probability
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">
            No props match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
