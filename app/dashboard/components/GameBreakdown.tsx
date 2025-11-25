import type { SimplifiedGame } from "@/app/api/nfl/odds/route";

export default function GameBreakdown({ game }: { game?: SimplifiedGame }) {
  if (!game) return null;

  return (
    <div
      style={{
        background: "#141414",
        padding: "1rem",
        borderRadius: "8px",
        border: "1px solid #333",
        marginTop: "1rem",
      }}
    >
      <h2 style={{ color: "#0ff", marginBottom: "0.5rem" }}>
        {game.awayTeam} @ {game.homeTeam}
      </h2>
      <p style={{ color: "#aaa" }}>Kickoff: {game.commenceTime}</p>
    </div>
  );
}
