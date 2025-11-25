// FILE: app/(member)/game-breakdown/page.tsx  (replace the previous file's bottom "Line Value Scan" section)
"use client";
import * as React from "react";
import type { Game, Prop } from "@/lib/types";
import { getPropsEnvelope } from "@/lib/useApi";
import { useGames } from "@/lib/hooks/useGames";
import TeamLogo from "@/components/TeamLogo";
import OddsTable from "./components/OddsTable";

type Sport = "americanfootball_nfl" | "basketball_nba";

export default function GameBreakdownPage() {
  const [sport, setSport] = React.useState<Sport>("americanfootball_nfl");
  const { games, loading, error } = useGames(sport);
  const [selectedGame, setSelectedGame] = React.useState<string>("");
  const [props, setProps] = React.useState<Prop[]>([]);
  const [propsLoading, setPropsLoading] = React.useState(false);
  const [propsError, setPropsError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setSelectedGame("");
    setProps([]);
  }, [sport]);

  React.useEffect(() => {
    if (!selectedGame) return;
    let mounted = true;
    setPropsLoading(true);
    setPropsError(null);
    (async () => {
      try {
        const route = sport === "americanfootball_nfl" ? "/api/nfl/props" : "/api/nba/props";
        const { props } = await getPropsEnvelope<Prop>(route, { gameId: selectedGame });
        if (mounted) setProps(props);
      } catch (e: any) {
        if (mounted) setPropsError(e?.message ?? "failed to load props");
      } finally {
        if (mounted) setPropsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [selectedGame, sport]);

  const game = React.useMemo(() => games.find((g) => g.id === selectedGame), [games, selectedGame]);
  const sportKey = sport === "basketball_nba" ? "nba" : "nfl";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Game Breakdown</h1>
        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1 rounded ${sport === "americanfootball_nfl" ? "bg-zinc-700" : "bg-zinc-900 border border-zinc-700"}`}
            onClick={() => setSport("americanfootball_nfl")}
          >
            NFL
          </button>
          <button
            className={`px-3 py-1 rounded ${sport === "basketball_nba" ? "bg-zinc-700" : "bg-zinc-900 border border-zinc-700"}`}
            onClick={() => setSport("basketball_nba")}
          >
            NBA
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm">Game</label>
        {loading ? (
          <div className="text-sm opacity-70">Loading games…</div>
        ) : error ? (
          <div className="text-sm text-red-400">Failed to load games — {error}</div>
        ) : (
          <select
            className="w-full bg-zinc-900 rounded px-2 py-2 border border-zinc-800"
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
          >
            <option value="">— Choose —</option>
            {games.map((g: Game) => (
              <option key={g.id} value={g.id}>
                {g.awayTeam} @ {g.homeTeam} — {new Date(g.commenceTime).toLocaleString()}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Game header */}
      {game && (
        <div className="rounded-xl border border-zinc-800 p-4 bg-zinc-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <TeamLogo team={game.awayTeam} sport={sportKey} />
                <span className="font-medium">{game.awayTeam}</span>
              </div>
              <span className="opacity-60">@</span>
              <div className="flex items-center gap-2">
                <TeamLogo team={game.homeTeam} sport={sportKey} />
                <span className="font-medium">{game.homeTeam}</span>
              </div>
            </div>
            <div className="text-sm opacity-70">{new Date(game.commenceTime).toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* Narrative + quick props */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 rounded-xl border border-zinc-800 p-4 bg-zinc-900">
          <div className="font-medium mb-2">AI Game Notes</div>
          {game ? (
            <p className="text-sm opacity-90">
              Model preview: pace, usage, and matchup trends suggest a{" "}
              <span className="font-medium">balanced</span> script with exploitable player-prop value.
            </p>
          ) : (
            <div className="text-sm opacity-70">Select a game to see notes.</div>
          )}
        </div>

        <div className="rounded-xl border border-zinc-800 p-4 bg-zinc-900">
          <div className="font-medium mb-2">Quick Props Snapshot</div>
          {propsLoading ? (
            <div className="text-sm opacity-70">Loading props…</div>
          ) : propsError ? (
            <div className="text-sm text-red-400">{propsError}</div>
          ) : props.length ? (
            <ul className="space-y-2">
              {props.slice(0, 6).map((p) => (
                <li key={p.id} className="flex items-center justify-between">
                  <span className="text-sm">
                    {p.player} — {p.market} {p.line ?? ""}
                  </span>
                  <span className="text-xs opacity-80">{p.odds}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm opacity-70">Pick a game to view props.</div>
          )}
        </div>
      </div>

      {/* Line Value Scan — now real data */}
      <div className="rounded-xl border border-zinc-800 p-4 bg-zinc-900">
        <div className="font-medium mb-3">Line Value Scan</div>
        {game ? <OddsTable game={game} /> : <div className="text-sm opacity-70">Select a game.</div>}
      </div>
    </div>
  );
}
