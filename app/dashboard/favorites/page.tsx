"use client";

import { useFavorites } from "@/context/FavoritesContext";
import Link from "next/link";
import PlayerPhoto from "@/components/PlayerPhoto";
import TeamLogo from "@/components/TeamLogo";

export default function FavoritesPage() {
  const { favorites } = useFavorites();

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="text-sm text-slate-300">
        ← Back to Dashboard
      </Link>

      <h1 className="text-2xl font-semibold">Favorites</h1>

      {favorites.length === 0 ? (
        <p className="text-slate-400 text-sm">You haven’t saved anything yet.</p>
      ) : (
        <div className="space-y-3">
          {favorites.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                {f.type === "player" && <PlayerPhoto name={f.label} size={34} />}
                {f.type === "game" && (
                  <TeamLogo
                    team={f.extra?.homeTeam}
                    sport={f.extra?.sport}
                    size={22}
                  />
                )}
                <div>
                  <div className="font-semibold">{f.label}</div>
                  {f.extra?.subtitle && (
                    <div className="text-xs text-slate-400">{f.extra.subtitle}</div>
                  )}
                </div>
              </div>
              <Link
                href={f.extra?.link ?? "/dashboard"}
                className="text-xs text-sky-400"
              >
                View →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
