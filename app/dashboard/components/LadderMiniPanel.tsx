// app/dashboard/components/LadderMiniPanel.tsx
"use client";

import { useRouter } from "next/navigation";

export default function LadderMiniPanel() {
  const router = useRouter();

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
        LADDER GENERATOR (PROPS)
      </h2>
      <p
        style={{
          color: "#b1bdd8",
          fontSize: "0.9rem",
          marginBottom: "0.9rem",
        }}
      >
        Build safe, ladder-style props between -500 and -1000 odds for your
        daily challenge. Use the full builder to search players and auto-generate
        a 3–4 leg ladder.
      </p>

      <button
        onClick={() => router.push("/ladder")}
        style={{
          width: "100%",
          padding: "0.7rem 0.9rem",
          borderRadius: "0.7rem",
          border: "none",
          background: "#00f2ff",
          color: "#02131c",
          fontWeight: 700,
          fontSize: "0.95rem",
          cursor: "pointer",
        }}
      >
        Open Full Ladder Builder
      </button>
    </div>
  );
}
