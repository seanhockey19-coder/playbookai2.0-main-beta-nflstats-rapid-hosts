// app/dashboard/game-breakdown/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Sport = "nfl" | "nba";

interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  commence: string;
  markets: any[];
}

interface PlayerProp {
  id: string;
  sport: string;
  player: string;
  team: string;
  market: string;
  line: number | null;
  odds: number;
  edge: number;
  game: string;
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

async function loadNFLProps(gameId: string): Promise<PlayerProp[]> {
  const res = await fetch(`/api/nfl/props?gameId=${gameId}`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

async function loadNBAProps(gameId: string): Promise<PlayerProp[]> {
  const res = await fetch(`/api/nba/props?gameId=${gameId}`, { cache: "no-store" });
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

export default function GameBreakdownPage() {
  const [sport, setSport] = useState<Sport>("nfl");
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGameId, setSelectedGameId] = useState("");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [props, setProps] = useState<PlayerProp[]>([]);
  const [loading, setLoading] = useState(true);

  // GAME SCRIPT STATE
  const [script, setScript] = useState<any>(null);
  const [scriptLoading, setScriptLoading] = useState(true);

  // Load games when sport changes
  useEffect(() => {
    async function init() {
      setLoading(true);
      const loadedGames = sport === "nfl" ? await loadNFLGames() : await loadNBAGames();
      setGames(loadedGames);
      const firstId = loadedGames[0]?.id ?? "";
      setSelectedGameId(firstId);
      setLoading(false);
    }
    init();
  }, [sport]);

  // Load selected game + props
  useEffect(() => {
    async function loadDetails() {
      if (!selectedGameId) return;

      const game = games.find((g) => g.id === selectedGameId) ?? null;
      setSelectedGame(game);
      if (!game) return;

      const loadedProps =
        sport === "nfl"
          ? await loadNFLProps(selectedGameId)
          : await loadNBAProps(selectedGameId);

      setProps(loadedProps);
    }
    loadDetails();
  }, [selectedGameId, games, sport]);

  // Load GAME SCRIPT AI
  useEffect(() => {
    async function loadScript() {
      if (!selectedGameId) return;
      setScriptLoading(true);

      const res = await fetch(
        `/api/game-script?gameId=${selectedGameId}&sport=${sport}`,
        { cache: "no-store" }
      );

      if (res.ok) {
        setScript(await res.json());
      }

      setScriptLoading(false);
    }

    loadScript();
  }, [selectedGameId, sport]);

  const h2h = selectedGame?.markets?.find((m: any) => m.key === "h2h");
  const spreads = selectedGame?.markets?.find((m: any) => m.key === "spreads");
  const totals = selectedGame?.markets?.find((m: any) => m.key === "totals");

  const topProps = props.slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-slate-300 hover:text-slate-100 mb-2"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Game Breakdown</h1>
          <p className="text-sm text-slate-400">
            Deep-dive into one matchup’s spreads, totals, moneylines, and props using live data.
          </p>
        </div>

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

      {/* Game selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <select
            value={selectedGameId}
            onChange={(e) => setSelectedGameId(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100"
          >
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.awayTeam} @ {g.homeTeam}
              </option>
            ))}
          </select>
          {selectedGame && (
            <div className="text-xs text-slate-400">
              Kickoff: {formatTime(selectedGame.commence)}
            </div>
          )}
        </div>

        <div className="text-xs text-slate-500">
          Live lines & props from The Odds API
        </div>
      </div>

      {/* Odds + Game Script + Props */}
      {loading || !selectedGame ? (
        <div className="text-sm text-slate-400">Loading game data…</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr),minmax(0,1.6fr)]">

          {/* ----------------------------- */}
          {/* LEFT COLUMN: ODDS */}
          {/* ----------------------------- */}
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                Core Lines
              </div>

              {/* Moneyline */}
              {h2h && (
                <div className="mb-3">
                  <div className="text-[10px] uppercase text-slate-500 mb-1">
                    Moneyline
                  </div>
                  <div className="flex gap-3 text-sm">
                    {h2h.outcomes?.map((o: any) => (
                      <div key={o.name} className="font-mono">
                        {o.name}: {o.price > 0 ? "+" : ""}
                        {o.price}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Spread */}
              {spreads && (
                <div className="mb-3">
                  <div className="text-[10px] uppercase text-slate-500 mb-1">
                    Spread
                  </div>
                  <div className="flex gap-3 text-sm">
                    {spreads.outcomes?.map((o: any) => (
                      <div key={o.name} className="font-mono">
                        {o.name}: {o.point} ({o.price > 0 ? "+" : ""}
                        {o.price})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total */}
              {totals && (
                <div>
                  <div className="text-[10px] uppercase text-slate-500 mb-1">
                    Total
                  </div>
                  <div className="flex gap-3 text-sm">
                    {totals.outcomes?.map((o: any) => (
                      <div key={o.name} className="font-mono">
                        {o.name}: {o.point} ({o.price > 0 ? "+" : ""}
                        {o.price})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ----------------------------- */}
          {/* MIDDLE COLUMN: GAME SCRIPT AI */}
          {/* ----------------------------- */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
            <h2 className="text-lg font-semibold">Game Script AI</h2>

            {scriptLoading ? (
              <div className="text-slate-400 text-sm">Analyzing matchup…</div>
            ) : (
              <>
                <div className="text-sm text-slate-300">
                  {script.summary}
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs text-slate-400">
                  <div>
                    <p className="font-semibold text-slate-200">Pace Score</p>
                    <p>{script.paceScore}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-200">Home Offense</p>
                    <p>{script.offenseRatingHome}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-200">Away Offense</p>
                    <p>{script.offenseRatingAway}</p>
                  </div>

                  <div>
                    <p className="font-semibold text-slate-200">Home Pass/Run</p>
                    <p>{script.passRunSplitHome.pass}% pass / {script.passRunSplitHome.run}% run</p>
                  </div>

                  <div>
                    <p className="font-semibold text-slate-200">Away Pass/Run</p>
                    <p>{script.passRunSplitAway.pass}% pass / {script.passRunSplitAway.run}% run</p>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-slate-200 text-sm mb-1">
                    Usage Boosts
                  </p>
                  <ul className="list-disc list-inside text-xs text-slate-400">
                    {script.usageBoosts.map((b: string, idx: number) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* ----------------------------- */}
          {/* RIGHT COLUMN: PROPS */}
          {/* ----------------------------- */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs uppercase tracking-wide text-slate-400">
                Sample Player Props
              </div>
              <Link
                href="/dashboard/player-props"
                className="text-xs text-sky-400 hover:text-sky-300"
              >
                Open full prop scanner →
              </Link>
            </div>

            {topProps.length === 0 ? (
              <div className="text-sm text-slate-400">
                No player props available yet for this game.
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                {topProps.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg bg-slate-900/80 px-3 py-2"
                  >
                    <div>
                      <div className="font-semibold">{p.player}</div>
                      <div className="text-xs text-slate-400">
                        {p.market.replace("player_", "").replace(/_/g, " ")}
                        {p.line !== null ? ` · ${p.line}` : ""}
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="font-mono text-slate-100">
                        {p.odds > 0 ? "+" : ""}
                        {p.odds}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Edge model coming soon
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
