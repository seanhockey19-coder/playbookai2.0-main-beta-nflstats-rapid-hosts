"use client";
import * as React from "react";
import type { Game } from "@/lib/types";
import { getGamesEnvelope } from "@/lib/useApi";
import TeamLogo from "@/components/TeamLogo";

export default function OddsPanel() {
  const [games, setGames] = React.useState<Game[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { games } = await getGamesEnvelope<Game>("/api/nfl/games");
        if (mounted) setGames(games);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "Unknown error");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="text-sm opacity-80">Loading games…</div>;
  if (error) return <div className="text-sm text-red-400">Failed to load games — {error}</div>;
  if (!games.length) return <div>No games found.</div>;

  return (
    <div className="space-y-2">
      {games.map((g) => (
        <div key={g.id} className="rounded-xl border border-zinc-800 p-3 bg-zinc-900">
          <div className="font-medium">
            <div className="flex items-center gap-2">
              <TeamLogo team={g.awayTeam} sport={"nfl"} />
              <span>{g.awayTeam}</span>
              <span className="opacity-60">@</span>
              <TeamLogo team={g.homeTeam} sport={"nfl"} />
              <span>{g.homeTeam}</span>
            </div>
          </div>
          <div className="text-xs opacity-70">{new Date(g.commenceTime).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}
