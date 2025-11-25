"use client";

type Sport = "nfl" | "nba";

interface SportSwitcherProps {
  sport: Sport;
  onChange: (sport: Sport) => void;
}

export default function SportSwitcher({ sport, onChange }: SportSwitcherProps) {
  const baseTab: React.CSSProperties = {
    flex: 1,
    padding: "0.55rem 0.75rem",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.08)",
    fontSize: "0.9rem",
    fontWeight: 500,
    cursor: "pointer",
    background: "transparent",
    color: "rgba(255,255,255,0.6)",
    transition: "all 0.15s ease",
  };

  const activeTab: React.CSSProperties = {
    ...baseTab,
    background: "linear-gradient(135deg,#3b82f6,#22c55e)",
    color: "#0b1020",
    borderColor: "transparent",
    boxShadow: "0 0 0 1px rgba(15,23,42,0.6),0 16px 40px rgba(15,23,42,0.8)",
  };

  const wrapper: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    padding: "0.25rem",
    borderRadius: "999px",
    background: "rgba(15,23,42,0.85)",
    border: "1px solid rgba(148,163,184,0.35)",
    boxShadow: "0 18px 40px rgba(15,23,42,0.85)",
  };

  return (
    <div style={wrapper}>
      <button
        type="button"
        style={sport === "nfl" ? activeTab : baseTab}
        onClick={() => onChange("nfl")}
      >
        NFL
      </button>
      <button
        type="button"
        style={sport === "nba" ? activeTab : baseTab}
        onClick={() => onChange("nba")}
      >
        NBA
      </button>
    </div>
  );
}
