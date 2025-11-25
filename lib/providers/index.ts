import type { Game, Prop, SportKey } from "@/lib/types";

export interface Provider {
  name: string;
  getGames(sport: SportKey): Promise<Game[]>;
  getPropsForGame(sport: SportKey, gameId: string): Promise<Prop[]>;
  healthy?(): Promise<boolean>;
}
