// FILE: app/parlay-builder/page.tsx
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

  // Load games when sport changes
  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    setSelectedGame("");
    setSelected({});
    (async () => {
      try {
        const path = sport === "americanfootball_nfl" ? "/api/nfl/games" : "/api/nba/games";
        const data = await getJSON<{ provider: string; games: Game[]; errors: string[] }>(path);
        if (mounted) setGames(data.games); // ✅ set array only
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "failed to load games");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [sport]);

  // Load props when game or sport changes
  React.useEffect(() => {
    if (!selectedGame) {
      setProps([]);
      return;
    }
    let mounted = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const route = sport === "americanfootball_nfl" ? "/api/nfl/props" : "/api/nba/props";
        const data = await getJSON<{ provider: string; props: Prop[]; errors: string[] }>(route, {
          gameId: selectedGame,
        });
        if (mounted) setProps(data.props); // ✅ set array only
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "failed to load props");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selectedGame, sport]);

  const selectedProps = React.useMemo(() => props.filter((p) => selected[p.id]), [props, selected]);

  const combinedAmerican = React.useMemo(() => {
    if (selectedProps.length === 0) return 0;
    return parlayAmerican(selectedProps.map((p) => p.odds));
  }, [selectedProps]);

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  return (
    <div className="p-6 space-y-6 text-zinc-100">
      <h1 className="text-2xl font-semibold">Parlay Builder</h1>

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
        <div className="md:col-span-2" />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="block mb-1
