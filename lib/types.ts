export type SportKey = "americanfootball_nfl" | "basketball_nba";

export interface Game {
  id: string;
  sport: SportKey;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string; // ISO
  markets: Record<string, unknown>;
}

export interface Prop {
  id: string;           // `${market}:${player}:${book}`
  sport: SportKey;
  gameId: string;
  gameLabel: string;    // "Away @ Home"
  player: string;
  market: string;       // e.g. player_pass_yds
  line: number | null;
  odds: number;         // american
  bookmaker?: string;
  homeTeam: string;
  awayTeam: string;
}

export interface ApiError {
  error: string;
  detail?: string;
}
