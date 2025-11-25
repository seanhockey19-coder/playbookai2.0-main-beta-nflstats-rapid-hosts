// FILE: lib/hooks/useGames.ts
import * as React from "react";
import type { Game } from "@/lib/types";
import { getGamesEnvelope } from "@/lib/useApi";

export function useGames(sport: "americanfootball_nfl" | "basketball_nba") {
  const [games, setGames] = React.useState<Game[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
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
    return () => {
      mounted = false;
    };
  }, [sport]);

  return { games, loading, error };
}
