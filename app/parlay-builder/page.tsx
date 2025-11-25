"use client";
import * as React from "react";
import { getJSON } from "@/lib/useApi";
import type { Game, Prop } from "@/lib/types";
import { parlayAmerican } from "@/lib/oddsMath";
import TeamLogo from "@/components/TeamLogo";

type Sport = "americanfootball_nfl" | "basketball_nba";

export default function ParlayBuilderPage() {
  const [sport, setSport] = React.useState<Sport>("americanfootball_nfl");
  const [games, setGames] = React.useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = React.useState<string>("");
  const [props, setProps] = React.useState<Prop[]>([]);
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    setSelectedGame("");
    (async () => {
      try {
        const path = sport === "americanfootball_nfl" ? "/api/nfl/games" : "/api/nba/games";
        const data = await getJSON<{provider:string;games:Game[];errors:string[]}>(path);
            if (mounted) setGames(data.games);
        if (mounted) setGames(data);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "failed to load games");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [sport]);

  React.useEffect(() => {
    if (!selectedGame) { setProps([]); return; }
    let mounted = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const route = sport === "americanfootball_nfl" ? "/api/nfl/props" : "/api/nba/props";
        const data = await getJSON<{provider:string;props:Prop[];errors:string[]}>(route, { gameId: selectedGame });
            if (mounted) setProps(data.props);
        if (mounted) setProps(data);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "failed to load props");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [selectedGame, sport]);

  const selectedProps = React.useMemo(() => props.filter(p => selected[p.id]), [props, selected]);
  const combinedAmerican = React.useMemo(() => {
    if (selectedProps.length === 0) return 0;
    return parlayAmerican(selectedProps.map(p => p.odds));
  }, [selectedProps]);

  const toggle = (id: string) => setSelected(s => ({ ...s, [id]: !s[id] }));

  return (
    <div className="p-6 space-y-6 text-zinc-100">
      <h1 className="text-2xl font-semibold">Parlay Builder</h1>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="flex items-center gap-2">
          <span>Sport</span>
          <select className="bg-zinc-900 rounded px-2 py-1 border border-zinc-800"
            value={sport} onChange={e=>setSport(e.target.value as Sport)}>
            <option value="americanfootball_nfl">NFL</option>
            <option value="basketball_nba">NBA</option>
          </select>
        </label>

        <div className="md:col-span-2"></div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="block mb-1">Select Game</label>
          {loading ? <div>Loading…</div> : error ? <div className="text-red-400">{error}</div> : (
            <select className="w-full bg-zinc-900 rounded px-2 py-2 border border-zinc-800"
              value={selectedGame} onChange={e=>setSelectedGame(e.target.value)}>
              <option value="">— Choose —</option>
              {games.map(g => (
                <option key={g.id} value={g.id}>
                  {g.awayTeam} @ {g.homeTeam} — {new Date(g.commenceTime).toLocaleString()}
                </option>
              ))}
            </select>
          )}

          <div className="mt-4 rounded-xl border border-zinc-800 p-3 bg-zinc-900">
            <div className="font-medium mb-2">Player Props</div><div className="text-xs opacity-70 mb-2">For NBA, you can also query api-basketball odds by passing <code>?raGameId=</code> to /api/nba/props.</div>
            <ul className="text-sm max-h-[60vh] overflow-auto space-y-1 pr-2">
              {props.map(p => (
                <li key={p.id} className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!selected[p.id]} onChange={()=>toggle(p.id)} />
                    <span>{p.player} — {p.market} {p.line ?? ""}</span>
                  </label>
                  <span className="opacity-80">{p.odds}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800 p-3 bg-zinc-900">
            <div className="font-medium mb-2">Slip</div>
            <div className="text-sm mb-2">{selectedProps.length} legs selected</div>
            <ul className="text-sm space-y-1 max-h-64 overflow-auto pr-2">
              {selectedProps.map(p => (
                <li key={p.id} className="flex justify-between gap-2">
                  <span>{p.player} — {p.market} {p.line ?? ""}</span>
                  <span className="opacity-80">{p.odds}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 text-sm">
              Combined odds: <span className="font-mono">{Math.round(combinedAmerican)}</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 p-3 bg-zinc-900">
            <div className="font-medium mb-2">Game</div>
            {selectedGame ? (()=>{
              const g = games.find(x=>x.id===selectedGame);
              if (!g) return <div className="text-sm opacity-70">No game.</div>;
              return (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <TeamLogo team={g.awayTeam} sport={sport === "basketball_nba" ? "nba" : "nfl"} />
                    <span>{g.awayTeam}</span>
                  </div>
                  <span className="opacity-60">@</span>
                  <div className="flex items-center gap-2">
                    <TeamLogo team={g.homeTeam} sport={sport === "basketball_nba" ? "nba" : "nfl"} />
                    <span>{g.homeTeam}</span>
                  </div>
                </div>
              );
            })() : <div className="text-sm opacity-70">No game selected.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
