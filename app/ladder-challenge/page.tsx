"use client";
import * as React from "react";
import type { Game, Prop } from "@/lib/types";
import { getGamesEnvelope, getPropsEnvelope } from "@/lib/useApi";
import { parlayAmerican, bankrollProgression } from "@/lib/oddsMath";
import TeamLogo from "@/components/TeamLogo";

type Sport = "americanfootball_nfl" | "basketball_nba";

export default function LadderChallengePage() {
  const [sport, setSport] = React.useState<Sport>("americanfootball_nfl");
  const [games, setGames] = React.useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = React.useState<string>("");
  const [props, setProps] = React.useState<Prop[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [bankroll, setBankroll] = React.useState(10);
  const [days, setDays] = React.useState(10);
  const [targetAmerican, setTargetAmerican] = React.useState(-110);

  // Load games for selected sport
  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    setSelectedGame("");
    (async () => {
      try {
        const path = sport === "americanfootball_nfl" ? "/api/nfl/games" : "/api/nba/games";
        const { games } = await getGamesEnvelope<Game>(path);
        if (mounted) setGames(games);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "failed to load games");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [sport]);

  // Load props for selected game
  React.useEffect(() => {
    if (!selectedGame) { setProps([]); return; }
    let mounted = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const route = sport === "americanfootball_nfl" ? "/api/nfl/props" : "/api/nba/props";
        const { props } = await getPropsEnvelope<Prop>(route, { gameId: selectedGame });
        if (mounted) setProps(props);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "failed to load props");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [selectedGame, sport]);

  // Auto safe legs (-500 to -1000)
  const safeLegs = React.useMemo(
    () => props.filter(p => p.odds <= -500 && p.odds >= -1000).slice(0, 40),
    [props]
  );

  // Combos near target (-100 default): pairs, then triples
  const combosNearTarget = React.useMemo(() => {
    const legs = safeLegs;
    const res: { ids: string[]; american: number }[] = [];
    for (let i = 0; i < legs.length; i++) {
      for (let j = i + 1; j < legs.length; j++) {
        const a = parlayAmerican([legs[i].odds, legs[j].odds]);
        if (Math.abs(a - targetAmerican) <= 20) res.push({ ids: [legs[i].id, legs[j].id], american: a });
      }
    }
    for (let i = 0; i < legs.length && res.length < 15; i++) {
      for (let j = i + 1; j < legs.length && res.length < 15; j++) {
        for (let k = j + 1; k < legs.length && res.length < 15; k++) {
          const a = parlayAmerican([legs[i].odds, legs[j].odds, legs[k].odds]);
          if (Math.abs(a - targetAmerican) <= 20) res.push({ ids: [legs[i].id, legs[j].id, legs[k].id], american: a });
        }
      }
    }
    return res.slice(0, 15);
  }, [safeLegs, targetAmerican]);

  const plan = bankrollProgression(bankroll, days, 0.1);

  return (
    <div className="p-6 space-y-6 text-zinc-100">
      <h1 className="text-2xl font-semibold">Ladder Challenge</h1>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="flex items-center gap-2">
          <span>Sport</span>
          <select
            className="bg-zinc-900 rounded px-2 py-1 border border-zinc-800"
            value={sport}
            onChange={(e) => setSport(e.target.value as Sport)}
          >
            <option value="americanfootball_nfl">NFL</option>
            <option value="basketball_nba">NBA</option>
          </select>
        </label>

        <label className="flex items-center gap-2">
          <span>Bankroll</span>
          <input
            className="bg-zinc-900 rounded px-2 py-1 border border-zinc-800 w-24"
            type="number"
            value={bankroll}
            onChange={(e) => setBankroll(Number(e.target.value))}
          />
        </label>

        <label className="flex items-center gap-2">
          <span>Days</span>
          <input
            className="bg-zinc-900 rounded px-2 py-1 border border-zinc-800 w-20"
            type="number"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-3">
          <div>
            <label className="block mb-1">Select Game</label>
            {loading ? (
              <div>Loading…</div>
            ) : error ? (
              <div className="text-red-400">{error}</div>
            ) : (
              <select
                className="w-full bg-zinc-900 rounded px-2 py-2 border border-zinc-800"
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
              >
                <option value="">— Choose —</option>
                {games.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.awayTeam} @ {g.homeTeam} — {new Date(g.commenceTime).toLocaleString()}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="rounded-xl border border-zinc-800 p-3 bg-zinc-900">
            <div className="font-medium mb-2">Auto Safe Legs (-500 to -1000)</div>
            {safeLegs.length === 0 ? (
              <div className="text-sm opacity-70">No safe legs yet.</div>
            ) : (
              <ul className="text-sm space-y-1 max-h-64 overflow-auto pr-2">
                {safeLegs.map((l) => (
                  <li key={l.id} className="flex justify-between gap-2">
                    <span>{l.player} — {l.market} {l.line ?? ""}</span>
                    <span className="opacity-80">{l.odds}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800 p-3 bg-zinc-900">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">Combos near -100</div>
              <label className="text-sm flex items-center gap-2">
                Target
                <input
                  className="bg-zinc-950 rounded px-2 py-1 border border-zinc-800 w-20"
                  type="number"
                  value={targetAmerican}
                  onChange={(e) => setTargetAmerican(Number(e.target.value))}
                />
              </label>
            </div>
            {combosNearTarget.length === 0 ? (
              <div className="text-sm opacity-70">No combos yet.</div>
            ) : (
              <ul className="text-sm space-y-1 max-h-64 overflow-auto pr-2">
                {combosNearTarget.map((c) => (
                  <li key={c.ids.join("-")} className="flex justify-between gap-2">
                    <span>{c.ids.length} legs</span>
                    <span className="opacity-80">{Math.round(c.american)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-zinc-800 p-3 bg-zinc-900">
            <div className="font-medium mb-2">Bankroll Tracker (example 10%/day)</div>
            <ul className="text-sm grid grid-cols-2 gap-1">
              {plan.map((b, i) => (
                <li key={i} className="flex justify-between">
                  <span>Day {i + 1}</span>
                  <span>${b.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {selectedGame && (
        <div className="rounded-xl border border-zinc-800 p-3 bg-zinc-900">
          <div className="font-medium mb-2">Selected Game</div>
          {(() => {
            const g = games.find((x) => x.id === selectedGame);
            if (!g) return <div className="text-sm opacity-70">No game.</div>;
            const sportKey = sport === "basketball_nba" ? "nba" : "nfl";
            return (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <TeamLogo team={g.awayTeam} sport={sportKey} />
                  <span>{g.awayTeam}</span>
                </div>
                <span className="opacity-60">@</span>
                <div className="flex items-center gap-2">
                  <TeamLogo team={g.homeTeam} sport={sportKey} />
                  <span>{g.homeTeam}</span>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
