import type { SimplifiedGame } from "@/app/api/nfl/odds/route";

export default function OddsCard({ game }: { game?: SimplifiedGame }) {
  if (!game) return null;

  const h2h = game.h2h?.outcomes ?? [];

  return (
    <div
      style={{
        background: "#111",
        padding: "1rem",
        borderRadius: "8px",
        border: "1px solid #333",
      }}
    >
      <h3 style={{ color: "#0ff", marginBottom: "0.5rem" }}>Team Odds</h3>

      {h2h.map((o, i) => (
        <div key={i} style={{ marginBottom: "0.5rem" }}>
          <strong>{o.name}</strong> — {o.price}
        </div>
      ))}
    </div>
  );
}
