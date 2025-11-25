"use client";
import * as React from "react";
import { resolveLogoUrl } from "@/lib/teamLogos";

type Props = {
  team: string;
  sport: "nba" | "nfl";
  size?: number; // px
  className?: string;
};

function heuristicCandidate(sport: "nba" | "nfl", team: string): string[] {
  const slug = team.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const espnBase = sport === "nba"
    ? "https://a.espncdn.com/i/teamlogos/nba/500"
    : "https://a.espncdn.com/i/teamlogos/nfl/500";
  return [`${espnBase}/${slug}.png`, `${espnBase}/scoreboard/${slug}.png`];
}

export default function TeamLogo({ team, sport, size = 28, className }: Props) {
  // 1) Explicit map (most reliable). 2) Heuristic candidates. 3) Initials fallback.
  const mapped = resolveLogoUrl(sport, team);
  const [srcs, setSrcs] = React.useState<string[]>([
    ...(mapped ? [mapped] : []),
    ...heuristicCandidate(sport, team),
  ]);
  const [failed, setFailed] = React.useState(false);

  const onError = () => {
    setSrcs((s) => s.slice(1));
    if (srcs.length <= 1) setFailed(true);
  };

  if (failed || srcs.length === 0) {
    const initials = (team || "?")
      .split(/\s+/)
      .map((s) => s[0]?.toUpperCase())
      .filter(Boolean)
      .slice(0, 3)
      .join("");
    return (
      <div
        className={`inline-flex items-center justify-center rounded-full bg-zinc-800 text-zinc-200 ${className || ""}`}
        style={{ width: size, height: size, fontSize: Math.max(10, Math.floor(size * 0.36)) }}
        title={team}
      >
        {initials || "?"}
      </div>
    );
  }

  return (
    <img
      src={srcs[0]}
      alt={team}
      width={size}
      height={size}
      className={`rounded-full object-contain bg-zinc-800 ${className || ""}`}
      onError={onError}
    />
  );
}
