"use client";

import { useEffect, useState } from "react";

type Sport = "nfl" | "nba";

interface AIPick {
  id: string;
  sport: Sport;
  gameId?: string;
  player: string;
  market: string;
  line: number;
  overOdds: number;
  modelEdgePct: number;
}

export default function AIPicksPage() {
  const [sport, setSport] = useState<Sport>("nfl");
  const [picks, setPicks] = useState<AIPick[]>([]);
  const [loading, setLoading] = useState(false);

  // Restore last sport from dashboard, if saved
  useEffect(() => {
    const saved = localStorage.getItem("activeSport");
    if (saved === "nfl" || saved === "nba") {
      setSport(saved);
    }
  }, []);

  // Fetch AI picks whenever sport changes
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/ai-picks?sport=${sport}`, {
          cache: "no-store",
        });
        const data = await res.json();
        setPicks(data.picks ?? []);
      } catch (err) {
        console.error("Error loading AI picks", err);
        setPicks([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sport]);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2rem",
        background:
          "radial-gradient(circle at top, #1e293b 0, #020617 55%, #000 100%)",
        color: "white",
        fontFamily:
          '-apple-system,BlinkMacSystemFont,"SF Pro Text",system-ui,sans-serif',
      }}
    >
      {/* Back button */}
      <button
        onClick={() => (window.location.href = "/dashboard")}
        style={{
          padding: "0.5rem 1rem",
          borderRadius: "999px",
          background: "linear-gradient(135deg,#3b82f6,#22c55e)",
          color: "#0f172a",
          fontWeight: 600,
          border: "none",
          cursor: "pointer",
          marginBottom: "1.5rem",
        }}
      >
        ← Back to Dashboard
      </button>

      {/* Header + sport tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.7rem", fontWeight: 600 }}>AI Picks</h1>
          <p style={{ marginTop: "0.5rem", color: "rgba(148,163,184,0.9)" }}>
            Top model edges for player props.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            padding: "0.25rem",
            borderRadius: "999px",
            background: "rgba(15,23,42,0.85)",
            border: "1px solid rgba(148,163,184,0.35)",
          }}
        >
          {(["nfl", "nba"] as Sport[]).map((s) => (
            <button
              key={s}
              onClick={() => {
                setSport(s);
                localStorage.setItem("activeSport", s);
              }}
              style={{
                flex: 1,
                padding: "0.4rem 0.75rem",
                borderRadius: "999px",
                border: "none",
                cursor: "pointer",
                background:
                  sport === s
                    ? "linear-gradient(135deg,#3b82f6,#22c55e)"
                    : "transparent",
                color: sport === s ? "#0f172a" : "rgba(209,213,219,0.9)",
                fontWeight: 500,
                fontSize: "0.9rem",
              }}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Picks list */}
      {loading ? (
        <div style={{ marginTop: "2rem", opacity: 0.7 }}>Loading picks…</div>
      ) : picks.length === 0 ? (
        <div style={{ marginTop: "2rem", opacity: 0.7 }}>
          No picks available. Check your API / model later.
        </div>
      ) : (
        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {picks.map((p) => (
            <div
              key={p.id}
              style={{
                padding: "1rem 1.25rem",
                borderRadius: "1rem",
                background:
                  "radial-gradient(circle at top left, rgba(37,99,235,0.15), rgba(15,23,42,0.95))",
                border: "1px solid rgba(148,163,184,0.35)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                fontSize: "0.95rem",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{p.player}</div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "rgba(148,163,184,0.9)",
                  }}
                >
                  {p.market} · line {p.line} · o{p.overOdds}
                </div>
              </div>
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#22c55e",
                  fontWeight: 600,
                }}
              >
                +{p.modelEdgePct.toFixed(1)}% edge
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
