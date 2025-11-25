import type { Provider } from "./index";
import type { SportKey, Game, Prop } from "@/lib/types";
import { getGames as getOddsGames, getPropsForGame as getOddsProps } from "@/lib/oddsApi";

export const OddsApiProvider: Provider = {
  name: "the-odds-api",
  async healthy() {
    try {
      const g = await getOddsGames("americanfootball_nfl");
      return Array.isArray(g);
    } catch { return false; }
  },
  getGames(sport: SportKey): Promise<Game[]> {
    return getOddsGames(sport);
  },
  getPropsForGame(sport: SportKey, gameId: string): Promise<Prop[]> {
    return getOddsProps(sport, gameId);
  },
};
