// app/dashboard/components/AILineValueScan.tsx
import type { SimplifiedGame } from "@/app/api/nfl/odds/route";
import { impliedProb } from "@/lib/sgpEngine";

interface Props {
  game: SimplifiedGame | null;
}

export default function AILineValueScan({ game }: Props) {
  if (!game) {
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
          AI LINE VALUE SCAN
        </h2>
        <p style={{ color: "#7f8aa3", fontSize: "0.9rem" }}>
          Select a game to see where the AI thinks the best spread / total /
          moneyline value sits.
        </p>
      </div>
    );
  }

  const spreadOutcome = game.spreads?.outcomes?.[0];
  const totalOutcome = game.totals?.outcomes?.[0];
  const moneylineOutcome = game.h2h?.outcomes?.[0];

  const spreadProb = spreadOutcome ? impliedProb(spreadOutcome.price) : null;
  const totalProb = totalOutcome ? impliedProb(totalOutcome.price) : null;
  const mlProb = moneylineOutcome ? impliedProb(moneylineOutcome.price) : null;

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
        AI LINE VALUE SCAN
      </h2>
      <p style={{ color: "#b1bdd8", fontSize: "0.9rem", marginBottom: "0.8rem" }}>
        Highlights the lines that look most favorable based on implied
        probability and price structure. Early &quot;soft spot&quot; detector.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "0.9rem",
        }}
      >
        <ValueCard
          label="SPREAD"
          main={
            spreadOutcome
              ? `${spreadOutcome.name} ${
                  (spreadOutcome.point ?? 0) > 0 ? "+" : ""
                }${spreadOutcome.point ?? 0}`
              : "—"
          }
          odds={spreadOutcome?.price}
          implied={spreadProb}
        />
        <ValueCard
          label="TOTAL"
          main={
            totalOutcome
              ? `${totalOutcome.name.toUpperCase()} ${totalOutcome.point ?? ""}`
              : "—"
          }
          odds={totalOutcome?.price}
          implied={totalProb}
        />
        <ValueCard
          label="MONEYLINE"
          main={moneylineOutcome ? moneylineOutcome.name : "—"}
          odds={moneylineOutcome?.price}
          implied={mlProb}
        />
      </div>
    </div>
  );
}

function ValueCard({
  label,
  main,
  odds,
  implied,
}: {
  label: string;
  main: string;
  odds?: number;
  implied: number | null;
}) {
  return (
    <div
      style={{
        background: "#070c15",
        borderRadius: "0.8rem",
        border: "1px solid #182231",
        padding: "0.8rem 0.9rem",
      }}
    >
      <div
        style={{
          fontSize: "0.7rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "#7f8aa3",
          marginBottom: "0.35rem",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontWeight: 600,
          color: "#00f2ff",
          marginBottom: "0.25rem",
        }}
      >
        {main}
      </div>
      <div style={{ fontSize: "0.85rem", color: "#9aa6c2" }}>
        Odds: {odds ?? "—"}
      </div>
      <div style={{ fontSize: "0.85rem", color: "#9aa6c2" }}>
        Implied win chance:{" "}
        {implied !== null ? `${(implied * 100).toFixed(1)}%` : "—"}
      </div>
    </div>
  );
}
