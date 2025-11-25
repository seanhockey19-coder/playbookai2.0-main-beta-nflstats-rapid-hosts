"use client";

import { useState } from "react";
import type { SimplifiedGame } from "@/app/api/nfl/odds/route";

interface MarketOption {
  id: string;
  label: string;
  odds: number;
  type: "moneyline" | "spread" | "total";
  valueScore: number;
}

interface ParlayLeg {
  id: string;
  label: string;
  odds: number;
  type: string;
}

export default function ParlayBuilder({ game }: { game?: SimplifiedGame }) {
  const [legs, setLegs] = useState<ParlayLeg[]>([]);

  if (!game) return null;

  const buildMarkets = (): MarketOption[] => {
    const markets: MarketOption[] = [];

    // MONEYLINE
    game.h2h?.outcomes?.forEach((o) => {
      markets.push({
        id: `ML-${o.name}`,
        label: `${o.name} ML`,
        odds: o.price,
        type: "moneyline",
        valueScore: 1,
      });
    });

    // SPREADS
    game.spreads?.outcomes?.forEach((o) => {
      const point = o.point ?? 0;

      markets.push({
        id: `SP-${o.name}`,
        label: `${o.name} ${point > 0 ? "+" : ""}${point}`,
        odds: o.price,
        type: "spread",
        valueScore: 1,
      });
    });

    // TOTALS
    game.totals?.outcomes?.forEach((o) => {
      const point = o.point ?? 0;

      markets.push({
        id: `TO-${o.name}`,
        label: `${o.name.toUpperCase()} ${point}`,
        odds: o.price,
        type: "total",
        valueScore: 1,
      });
    });

    return markets;
  };

  const addLeg = (m: MarketOption) => {
    if (legs.some((l) => l.id === m.id)) return;
    setLegs((prev) => [...prev, m]);
  };

  const removeLeg = (id: string) => {
    setLegs((prev) => prev.filter((l) => l.id !== id));
  };

  const calculateTotalOdds = () => {
    if (legs.length === 0) return 0;

    const decimalLegs = legs.map((leg) =>
      leg.odds > 0 ? 1 + leg.odds / 100 : 1 + 100 / Math.abs(leg.odds)
    );

    const decimalTotal = decimalLegs.reduce((a, b) => a * b, 1);

    return decimalTotal >= 2
      ? Math.round((decimalTotal - 1) * 100)
      : Math.round(-100 / (decimalTotal - 1));
  };

  const markets = buildMarkets();
  const totalOdds = calculateTotalOdds();

  return (
    <div
      style={{
        background: "#111",
        padding: "1rem",
        borderRadius: "8px",
        border: "1px solid #333",
        color: "white",
      }}
    >
      <h3 style={{ color: "#0ff" }}>
        Parlay Builder – {game.homeTeam} vs {game.awayTeam}
      </h3>

      <select
        onChange={(e) => {
          const selected = markets.find((m) => m.id === e.target.value);
          if (selected) addLeg(selected);
        }}
        style={{
          width: "100%",
          padding: "0.7rem",
          borderRadius: "4px",
          background: "#000",
          color: "white",
          border: "1px solid #333",
          marginBottom: "1rem",
        }}
      >
        <option value="">Add a market…</option>
        {markets.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label} ({m.odds})
          </option>
        ))}
      </select>

      {legs.map((l) => (
        <div
          key={l.id}
          style={{
            background: "#222",
            padding: "0.8rem",
            borderRadius: "6px",
            marginBottom: "0.5rem",
          }}
        >
          <strong>{l.label}</strong> — {l.odds}
          <button
            onClick={() => removeLeg(l.id)}
            style={{
              float: "right",
              background: "red",
              color: "white",
              border: "none",
              padding: "0.3rem 0.6rem",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          >
            Remove
          </button>
        </div>
      ))}

      <div
        style={{
          marginTop: "1rem",
          fontWeight: "bold",
          fontSize: "1.2rem",
          color: "#0f0",
        }}
      >
        Total Odds: {totalOdds > 0 ? `+${totalOdds}` : totalOdds}
      </div>
    </div>
  );
}
