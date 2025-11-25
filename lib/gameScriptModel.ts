// lib/gameScriptModel.ts

/**
 * GAME SCRIPT MODEL
 * This is a lightweight predictive engine that turns basic
 * market data (spread, total, teams) into:
 *  - pace score
 *  - offensive tendencies
 *  - defensive matchups
 *  - narrative game flow summary
 * 
 * Later in Phase 4, we'll plug in real stats feeds.
 */

export interface GameScriptInput {
  sport: "nfl" | "nba";
  homeTeam: string;
  awayTeam: string;
  spread: number | null; // home spread (-3 means home favored by 3)
  total: number | null;  // over/under
}

export interface GameScriptOutput {
  paceScore: number;   // 0–100
  offenseRatingHome: number;
  offenseRatingAway: number;
  defenseRatingHome: number;
  defenseRatingAway: number;
  passRunSplitHome: { pass: number; run: number };
  passRunSplitAway: { pass: number; run: number };
  usageBoosts: string[];
  summary: string;
}

export function computeGameScript(input: GameScriptInput): GameScriptOutput {
  const { sport, homeTeam, awayTeam, spread, total } = input;

  // ----------------------
  // Pace Score
  // ----------------------
  let paceScore = 50;
  if (total !== null) {
    if (total >= (sport === "nba" ? 230 : 50)) paceScore += 18;
    if (total <= (sport === "nba" ? 215 : 41)) paceScore -= 12;
  }

  // ----------------------
  // Offensive Ratings
  // ----------------------
  let offenseRatingHome = 50;
  let offenseRatingAway = 50;

  if (spread !== null) {
    if (spread < 0) offenseRatingHome += 10; // favored
    if (spread > 0) offenseRatingAway += 10; // underdog away team expected to be trailing
  }

  // ----------------------
  // Defensive Ratings
  // ----------------------
  let defenseRatingHome = 50;
  let defenseRatingAway = 50;

  if (spread !== null) {
    if (spread > 0) defenseRatingHome -= 5;
    if (spread < 0) defenseRatingAway -= 5;
  }

  // ----------------------
  // Pass / Run Splits
  // ----------------------
  function computeSplit(spread: number | null) {
    if (spread === null) return { pass: 55, run: 45 };

    if (sport === "nfl") {
      if (spread < -4) return { pass: 48, run: 52 }; // home leading
      if (spread > 4) return { pass: 60, run: 40 }; // home trailing
      return { pass: 55, run: 45 };
    }

    // NBA
    return { pass: 100, run: 0 };
  }

  const splitHome = computeSplit(spread);
  const splitAway = computeSplit(spread !== null ? -spread : null);

  // ----------------------
  // Usage Boosts (AI heuristics)
  // ----------------------
  const usageBoosts: string[] = [];

  if (sport === "nfl") {
    if (splitHome.pass > 55) usageBoosts.push(`${homeTeam} WRs projected to see elevated targets`);
    if (splitAway.pass > 55) usageBoosts.push(`${awayTeam} WRs projected for increased receiving volume`);
    if (splitHome.run > 50) usageBoosts.push(`${homeTeam} RBs projected for heavier touches`);
    if (splitAway.run > 50) usageBoosts.push(`${awayTeam} RBs expected to run more`);
  } else {
    if (paceScore > 60) usageBoosts.push(`High pace benefits scorers & assist-heavy players`);
    if (paceScore < 45) usageBoosts.push(`Slower tempo benefits rebounders`);
  }

  // ----------------------
  // Game Summary
  // ----------------------
  const summary = `
    Expected pace: ${paceScore}.
    ${spread !== null ? (spread < 0 ? `${homeTeam} expected to control the game.` : `${awayTeam} may be playing from behind.`) : ""}
    Watch for: ${usageBoosts.join(", ") || "balanced usage."}
  `.trim();

  return {
    paceScore,
    offenseRatingHome,
    offenseRatingAway,
    defenseRatingHome,
    defenseRatingAway,
    passRunSplitHome: splitHome,
    passRunSplitAway: splitAway,
    usageBoosts,
    summary,
  };
}
