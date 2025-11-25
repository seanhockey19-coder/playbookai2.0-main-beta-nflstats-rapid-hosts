// FILE: lib/useApi.ts
// Purpose: Typed client helpers for API envelopes to avoid passing the wrong shape into React state.
// Why: Your API returns { provider, games/props, errors }. These helpers unwrap with types.

export type GamesEnvelope<TGame> = {
  provider: string;
  games: TGame[];
  errors: string[];
};

export type PropsEnvelope<TProp> = {
  provider: string;
  props: TProp[];
  errors: string[];
};

/**
 * Generic GET returning parsed JSON. No-store to avoid caching live odds.
 */
export async function getJSON<T>(path: string, params?: Record<string, string>): Promise<T> {
  const qs = params
    ? "?" +
      Object.entries(params)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join("&")
    : "";
  const res = await fetch(`${path}${qs}`, { cache: "no-store" });
  if (!res.ok) {
    const text = (await res.text().catch(() => "")).slice(0, 4096);
    throw new Error(`GET ${path} failed: ${res.status} ${text}`);
  }
  return (await res.json()) as T;
}

/**
 * Strongly-typed games envelope fetcher so callers always destructure `.games`.
 */
export async function getGamesEnvelope<TGame>(
  path: "/api/nfl/games" | "/api/nba/games"
): Promise<GamesEnvelope<TGame>> {
  return getJSON<GamesEnvelope<TGame>>(path);
}

/**
 * Strongly-typed props envelope fetcher. Accepts either `{ gameId }` or `{ raGameId }`.
 * - `/api/nfl/props?gameId=...`
 * - `/api/nba/props?gameId=...` or `/api/nba/props?raGameId=...` (api-basketball)
 */
export async function getPropsEnvelope<TProp>(
  path: "/api/nfl/props" | "/api/nba/props",
  params:
    | { gameId: string; raGameId?: never }
    | { raGameId: string; gameId?: never }
): Promise<PropsEnvelope<TProp>> {
  // Narrow to a plain record for getJSON signature.
  const qp: Record<string, string> =
    "gameId" in params ? { gameId: params.gameId } : { raGameId: (params as any).raGameId };
  return getJSON<PropsEnvelope<TProp>>(path, qp);
}
