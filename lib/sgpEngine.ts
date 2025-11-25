// ------------------------------------------------------------
// SGP ENGINE — Clean, Fully Typed, Error-Free
// ------------------------------------------------------------

// Utility: Convert American odds → implied probability
export const impliedProb = (odds: number): number => {
  if (odds > 0) return 100 / (100 + odds);
  return Math.abs(odds) / (100 + Math.abs(odds));
};

export interface SGPCandidate {
  label: string;
  odds: number;
  prob: number;
  value: number;
  category: string;
  point?: number | null;
}

// Main SGP generator
export const generateBestSGP = (game: any) => {
  const candidates: SGPCandidate[] = [];

  const ml = game.h2h?.outcomes || [];
  const spreads = game.spreads?.outcomes || [];
  const totals = game.totals?.outcomes || [];

  // ----------------------------------------
  // MONEYLINE
  // ----------------------------------------
  ml.forEach((o) => {
    const prob = impliedProb(o.price);
    candidates.push({
      label: `${o.name} ML`,
      odds: o.price,
      prob,
      value: prob * 100,
      category: "moneyline",
    });
  });

  // ----------------------------------------
  // SPREADS
  // ----------------------------------------
  spreads.forEach((o) => {
    const point = o.point ?? 0;
    const prob = impliedProb(o.price);

    candidates.push({
      label: `${o.name} ${point > 0 ? "+" : ""}${point}`,
      odds: o.price,
      prob,
      value: prob * 100,
      category: "spread",
      point,
    });
  });

  // ----------------------------------------
  // TOTALS
  // ----------------------------------------
  totals.forEach((o) => {
    const point = o.point ?? 0;
    const prob = impliedProb(o.price);

    candidates.push({
      label: `${o.name.toUpperCase()} ${point}`,
      odds: o.price,
      prob,
      value: prob * 100,
      category: "total",
      point,
    });
  });

  // ----------------------------------------
  // Compute score & sort
  // ----------------------------------------
  const sorted = candidates
    .map((c) => ({
      ...c,
      score: c.value + c.prob * 100,
    }))
    .sort((a, b) => b.score - a.score);

  return sorted;
};
