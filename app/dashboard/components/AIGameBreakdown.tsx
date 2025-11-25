"use client";

interface SimplifiedGame {
  id?: string;
  homeTeam: string;
  awayTeam: string;
  homeWinPct?: number;
  awayWinPct?: number;
  projectedPoints?: number;
  pace?: string;

  // Total line may exist in multiple places depending on API response
  totalLine?: number;
  total?: number;
  overUnder?: number;
  odds?: {
    total?: number;
  };
}

export default function AIGameBreakdown({
  game,
  loading,
}: {
  game: SimplifiedGame | null;   // ✅ FIXED (accept null)
  loading: boolean;
}) {
  if (loading) {
    return (
      <div
        style={{
          background: "#050910",
          padding: "1.3rem",
          borderRadius: "1rem",
          border: "1px solid #151a23",
          color: "#8899aa",
        }}
      >
        Loading AI breakdown…
      </div>
    );
  }

  if (!game) {
    return (
      <div
        style={{
          background: "#050910",
          padding: "1.3rem",
          borderRadius: "1rem",
          border: "1px solid #151a23",
          color: "#8899aa",
        }}
      >
        Select a game to see breakdown.
      </div>
    );
  }

  // ✅ Safely resolve total line, no matter where it exists
  const resolvedTotal =
    game.totalLine ??
    game.total ??
    game.overUnder ??
    game.odds?.total ??
    "—";

  return (
    <div
      style={{
        background: "#050910",
        borderRadius: "1rem",
        border: "1px solid #151a23",
        padding: "1.1rem 1.2rem",
        minHeight: "240px",
      }}
    >
      <h2
        style={{
          fontSize: "0.95rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "#7f8aa3",
          marginBottom: "0.7rem",
        }}
      >
        AI GAME BREAKDOWN
      </h2>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1.2rem",
          marginBottom: "1.2rem",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              color: "#7f8aa3",
              marginBottom: "0.2rem",
            }}
          >
            Away
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>
            {game.awayTeam}
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              color: "#7f8aa3",
              marginBottom: "0.2rem",
            }}
          >
            Projected Total
          </div>
          <div style={{ fontSize: "1.4rem", color: "#00f2ff" }}>
            {resolvedTotal}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              color: "#7f8aa3",
              marginBottom: "0.2rem",
            }}
          >
            Home
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>
            {game.homeTeam}
          </div>
        </div>
      </div>

      <p style={{ fontSize: "0.9rem", color: "#b1bdd8", lineHeight: 1.45 }}>
        {game.awayTeam} and {game.homeTeam} match up in a game that currently
        profiles as{" "}
        <span style={{ color: "#00f2ff" }}>high pace</span>, with market totals
        sitting around{" "}
        <span style={{ color: "#00f2ff" }}>{resolvedTotal}</span>. This panel
        updates live as the AI evaluates shifts in moneyline, spread, and total
        pricing.
      </p>
    </div>
  );
}
