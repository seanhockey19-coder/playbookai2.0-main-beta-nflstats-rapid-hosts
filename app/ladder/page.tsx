"use client";

export default function LadderPage() {
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
      {/* BACK BUTTON */}
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

      <h1 style={{ fontSize: "1.7rem", fontWeight: 600 }}>
        Ladder Challenge
      </h1>
      <p style={{ marginTop: "0.5rem", color: "rgba(148,163,184,0.9)" }}>
        Day-by-day builder following your $10 → $10,000 strategy.
      </p>

      <div style={{ marginTop: "2rem" }}>
        <DayCard day={1} amount="$10 → $20" player="Tony Pollard o39.5 RY" />

        <DayCard day={2} amount="$20 → $40" player="Jaylen Brown o1.5 3PT" />

        <DayCard
          day={3}
          amount="$40 → $80"
          player="Tyreek Hill o49.5 Yards"
        />
      </div>
    </div>
  );
}

function DayCard({
  day,
  amount,
  player,
}: {
  day: number;
  amount: string;
  player: string;
}) {
  return (
    <div
      style={{
        padding: "1rem 1.25rem",
        borderRadius: "1rem",
        background:
          "radial-gradient(circle at top left, rgba(37,99,235,0.12), rgba(15,23,42,0.95))",
        border: "1px solid rgba(148,163,184,0.35)",
        marginBottom: "1rem",
      }}
    >
      <div style={{ fontSize: "0.8rem", color: "rgba(148,163,184,0.9)" }}>
        Day {day}
      </div>
      <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>{amount}</div>
      <div
        style={{
          marginTop: "0.35rem",
          fontSize: "0.95rem",
          color: "rgba(255,255,255,0.9)",
        }}
      >
        Pick: <strong>{player}</strong>
      </div>
    </div>
  );
}
