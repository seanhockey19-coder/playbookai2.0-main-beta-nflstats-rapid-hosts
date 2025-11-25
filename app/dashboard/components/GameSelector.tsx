// app/dashboard/components/GameSelector.tsx
"use client";

import type { SimplifiedGame } from "@/app/api/nfl/odds/route";

interface Props {
  games: SimplifiedGame[];
  selectedGameId: string | null;
  onChange: (id: string) => void;
  loading: boolean;
}

export default function GameSelector({
  games,
  selectedGameId,
  onChange,
  loading,
}: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div
      style={{
        background: "#050910",
        borderRadius: "1rem",
        border: "1px solid #151a23",
        padding: "0.9rem 1rem",
        marginBottom: "1.3rem",
      }}
    >
      <label
        style={{
          display: "block",
          fontSize: "0.85rem",
          color: "#7f8aa3",
          marginBottom: "0.4rem",
        }}
      >
        Select Game
      </label>

      <select
        value={selectedGameId ?? ""}
        onChange={handleChange}
        disabled={loading || games.length === 0}
        style={{
          width: "100%",
          padding: "0.7rem 0.9rem",
          borderRadius: "0.6rem",
          border: "1px solid #242b38",
          background: "#02040a",
          color: "#e2e7f5",
          fontSize: "0.95rem",
          outline: "none",
        }}
      >
        {loading && <option>Loading games…</option>}
        {!loading && games.length === 0 && (
          <option>No live games available</option>
        )}
        {!loading &&
          games.map((g) => (
            <option key={g.id} value={g.id}>
              {g.awayTeam} @ {g.homeTeam}
            </option>
          ))}
      </select>
    </div>
  );
}
