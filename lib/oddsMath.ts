// Odds & parlay math helpers
export function americanToDecimal(odds: number): number {
  if (odds === 0) return 1;
  return odds > 0 ? 1 + odds / 100 : 1 + 100 / Math.abs(odds);
}
export function decimalToAmerican(dec: number): number {
  if (dec <= 1) return 0;
  return dec >= 2 ? Math.round((dec - 1) * 100) : Math.round(-100 / (dec - 1));
}
export function impliedProbFromAmerican(odds: number): number {
  if (odds > 0) return 100 / (odds + 100);
  return Math.abs(odds) / (Math.abs(odds) + 100);
}
export function parlayDecimal(legs: number[]): number {
  return legs.reduce((acc, d) => acc * d, 1);
}
export function parlayAmerican(americanLegs: number[]): number {
  const dec = parlayDecimal(americanLegs.map(americanToDecimal));
  return decimalToAmerican(dec);
}
export function bankrollProgression(start: number, days: number, dailyReturnPct: number): number[] {
  const out: number[] = [];
  let b = start;
  for (let i = 0; i < days; i++) {
    out.push(b);
    b = b * (1 + dailyReturnPct);
  }
  return out;
}
export function withinRange(odds: number, min: number, max: number): boolean {
  if (min > max) [min, max] = [max, min];
  return odds <= max && odds >= min;
}
