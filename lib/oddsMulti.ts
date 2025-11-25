import type { Game, Prop, SportKey } from "@/lib/types";
import type { Provider } from "@/lib/providers";
import { OddsApiProvider } from "@/lib/providers/oddsapi";
import { RapidApiOddsProvider } from "@/lib/providers/rapidapiOdds";
import { RapidApiNflProvider } from "@/lib/providers/rapidapiNfl";
import { RapidApiNbaProvider } from "@/lib/providers/rapidapiNba";
import { RapidApiApiBasketballProvider } from "@/lib/providers/rapidapiApiBasketball";

function providerList(): Provider[] {
  const list: Provider[] = [OddsApiProvider];
  // RapidAPI generic
  list.push(RapidApiOddsProvider);
  // sport specifics
  list.push(RapidApiNflProvider, RapidApiNbaProvider, RapidApiApiBasketballProvider);
  return list;
}

export async function getGamesAny(sport: SportKey): Promise<{ provider: string; games: Game[]; errors: string[] }>{ 
  const errors: string[] = [];
  for (const p of providerList()) {
    try {
      const games = await p.getGames(sport);
      if (games && games.length) return { provider: p.name, games, errors };
      // try next if empty
    } catch (e: any) {
      errors.push(`${p.name}: ${e?.message || e}`);
    }
  }
  return { provider: "none", games: [], errors };
}

export async function getPropsAny(sport: SportKey, gameId: string): Promise<{ provider: string; props: Prop[]; errors: string[] }>{ 
  const errors: string[] = [];
  for (const p of providerList()) {
    try {
      const props = await p.getPropsForGame(sport, gameId);
      if (props && props.length) return { provider: p.name, props, errors };
    } catch (e: any) {
      errors.push(`${p.name}: ${e?.message || e}`);
    }
  }
  return { provider: "none", props: [], errors };
}
