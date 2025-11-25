// FILE: app/(member)/game-breakdown/components/OddsTable.tsx
"use client";
import * as React from "react";
import type { Game } from "@/lib/types";
import { impliedProbFromAmerican } from "@/lib/oddsMath";

// Minimal types for Odds API markets
type Outcome = { name: string; price: number; point?: number };
type Market = { key: string; outcomes?: Outcome[] };
type BookMarket = Market;

function getMarket(game: Game, key: "h2h" | "spreads" | "totals"): BookMarket | null {
  const anyMarket = (game.markets as any)?.[key];
  if (!anyMarket) return null;
  // Odds API puts an array-of-markets per bookmaker. We stored the first bookmaker's market in lib/oddsApi.
  // Accept both array and single object shapes defensively.
  if (Array.isArray(anyMarket)) return anyMarket[0] ?? null;
  return anyMarket;
}

function fmtAmerican(odds: number | null | undefined) {
  if (odds === null || odds === undefined) return "—";
  return odds > 0 ? `+${odds}` : `${odds}`;
}
function fmtPct(p: number | null | undefined) {
  if (p === null || p === undefined) return "—";
  return `${(p * 100).toFixed(1)}%`;
}

export default function OddsTable({ game }: { game: Game }) {
  const h2h = getMarket(game, "h2h");
  const spreads = getMarket(game, "spreads");
  const totals = getMarket(game, "totals");

  const moneyline = React.useMemo(() => {
    if (!h2h?.outcomes?.length) return null;
    // Outcomes usually named by team
    const home = h2h.outcomes.find((o) => o.name === game.homeTeam) ?? h2h.outcomes[0];
    const away = h2h.outcomes.find((o) => o.name === game.awayTeam) ?? h2h.outcomes[1];
    if (!home || !away) return null;
    return {
      home: { team: game.homeTeam, odds: home.price, ip: impliedProbFromAmerican(home.price) },
      away: { team: game.awayTeam, odds: away.price, ip: impliedProbFromAmerican(away.price) },
    };
  }, [h2h, game]);

  const spreadRow = React.useMemo(() => {
    if (!spreads?.outcomes?.length) return null;
    // Typically two outcomes: home and away with .point and .price
    // We try to match teams; fallback to first two.
    const home = spreads.outcomes.find((o) => o.name === game.homeTeam) ?? spreads.outcomes[0];
    const away = spreads.outcomes.find((o) => o.name === game.awayTeam) ?? spreads.outcomes[1];
    if (!home || !away) return null;
    return {
      home: {
        team: game.homeTeam,
        line: home.point ?? null,
        odds: home.price,
        ip: impliedProbFromAmerican(home.price),
      },
      away: {
        team: game.awayTeam,
        line: away.point ?? null,
        odds: away.price,
        ip: impliedProbFromAmerican(away.price),
      },
    };
  }, [spreads, game]);

  const totalRow = React.useMemo(() => {
    if (!totals?.outcomes?.length) return null;
    // Outcomes typically "Over" / "Under" with .point as total
    const over = totals.outcomes.find((o) => /^over$/i.test(o.name)) ?? totals.outcomes[0];
    const under = totals.outcomes.find((o) => /^under$/i.test(o.name)) ?? totals.outcomes[1];
    if (!over || !under) return null;
    const line = over.point ?? under.point ?? null;
    return {
      over: { label: "Over", line, odds: over.price, ip: impliedProbFromAmerican(over.price) },
      under: { label: "Under", line, odds: under.price, ip: impliedProbFromAmerican(under.price) },
    };
  }, [totals]);

  const nothing =
    !moneyline && !spreadRow && !totalRow ? (
      <div className="text-sm opacity-70">No live markets available for this game yet.</div>
    ) : null;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {/* Spread */}
      <div className="rounded-xl border border-zinc-800 p-3 bg-zinc-900">
        <div className="text-xs uppercase tracking-wide opacity-70 mb-2">Spread</div>
        {spreadRow ? (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="opacity-80">
                {spreadRow.away.team} {spreadRow.away.line !== null ? spreadRow.away.line : ""} ({fmtAmerican(spre
