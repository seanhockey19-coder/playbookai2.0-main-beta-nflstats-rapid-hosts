// app/dashboard/components/GamePropsPanel.tsx
"use client";

import { useEffect, useState } from "react";
import type { SimplifiedGame } from "@/app/api/nfl/odds/route";

interface Props {
  game: SimplifiedGame | null;
}

export default function GamePropsPanel({ game }: Props) {
  const [loading, setLoading] = useState(false);
  const [propsData, setPropsData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!game) return;
      try {
        setLoading(true);
        setError(null);
        setPropsData([]);

        const params = new URLSearchParams({
          home: game.homeTeam,
          away: game.awayTeam,
        });

        const res = await fetch(`/api/nfl/props?${params.toString()}`);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Failed to load props");
        }

        setPropsData(json.props || []);
      } catch (err: any) {
        setError(err.message || "Unable to load props.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [game?.id]);

  return (
    <div
      style={{
        background: "#050910",
        borderRadius: "1rem",
        border: "1px solid #151a23",
        padding: "1.1rem 1.2rem",
      }}
    >
      <h2
        style={{
          fontSize: "0.95rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "#7f8aa3",
          marginBottom: "0.6rem",
        }}
      >
        PROPS
      </h2>

      {!game && (
        <p style={{ color: "#7f8aa3", fontSize: "0.9rem" }}>
          Select a game to see top player props.
        </p>
      )}

      {game && loading && (
        <p style={{ color: "#7f8aa3", fontSize: "0.9rem" }}>Loading props…</p>
      )}

      {game && error && (
        <p style={{ color: "#ff8b7f", fontSize: "0.9rem" }}>{error}</p>
      )}

      {game && !loading && !error && propsData.length === 0 && (
        <p style={{ color: "#7f8aa3", fontSize: "0.9rem" }}>
          No props available for this game (yet).
        </p>
      )}

      {game && propsData.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          {propsData.slice(0, 5).map((p, idx) => (
            <div
              key={idx}
              style={{
                background: "#070c15",
                borderRadius: "0.7rem",
                border: "1px solid #182231",
                padding: "0.6rem 0.75rem",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: "#e2e7f5",
                  marginBottom: "0.1rem",
                }}
              >
                {p.player}
              </div>
              <div style={{ fontSize: "0.85rem", color: "#9aa6c2" }}>
                {p.stat?.replace(/_/g, " ")} • Line: {p.line} • Odds: {p.odds}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
