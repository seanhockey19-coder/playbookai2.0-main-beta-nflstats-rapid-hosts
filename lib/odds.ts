// lib/odds.ts

// American → implied probability (0–1)
export function americanToImplied(odds: number): number {
  if (odds < 0) {
    return Math.abs(odds) / (Math.abs(odds) + 100);
  }
  return 100 / (odds + 100);
}

// Implied probability (0–1) → American odds
export function impliedToAmerican(prob: number): number {
  if (prob <= 0) return 0;
  if (prob >= 1) return -10000;
  if (prob > 0.5) {
    return Math.round(-prob / (1 - prob) * 100);
  } else {
    return Math.round((1 - prob) / prob * 100);
  }
}

// Combine multiple legs (American odds[]) into a single
// parlay decimal and American odds
export function combineAmericanOdds(oddsList: number[]) {
  if (!oddsList.length) return { decimal: 1, american: 0 };

  const decimals = oddsList.map((odds) =>
    odds < 0 ? 1 + 100 / Math.abs(odds) : 1 + odds / 100
  );

  const combinedDecimal = decimals.reduce((acc, val) => acc * val, 1);

  const american =
    combinedDecimal >= 2
      ? Math.round((combinedDecimal - 1) * 100)
      : Math.round(-100 / (combinedDecimal - 1));

  return { decimal: combinedDecimal, american };
}
