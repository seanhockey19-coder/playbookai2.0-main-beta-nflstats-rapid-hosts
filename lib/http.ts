const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchJson<T>(
  url: string,
  opts: RequestInit & { timeoutMs?: number; retries?: number } = {}
): Promise<T> {
  const timeoutMs = Number(process.env.ODDS_API_TIMEOUT_MS ?? 10000);
  const retries = Number(process.env.ODDS_API_RETRIES ?? 2);

  let attempt = 0;
  let lastErr: unknown = undefined;

  while (attempt <= retries) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), opts.timeoutMs ?? timeoutMs);

    try {
      const res = await fetch(url, {
        ...opts,
        signal: controller.signal,
        cache: "no-store",
      });

      const remain = res.headers.get("x-requests-remaining");
      const used = res.headers.get("x-requests-used");
      if (remain || used) console.info("[OddsAPI] quota", { remain, used });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        const err = new Error(`HTTP ${res.status} ${res.statusText} :: ${text?.slice(0, 200)}`);
        if ((res.status === 429 || res.status >= 500) && attempt < retries) {
          attempt += 1;
          const backoff = 500 * attempt;
          clearTimeout(id);
          await sleep(backoff);
          continue;
        }
        throw err;
      }

      const data = (await res.json()) as T;
      clearTimeout(id);
      return data;
    } catch (e) {
      lastErr = e;
      if (attempt < retries) {
        attempt += 1;
        const backoff = 500 * attempt;
        await sleep(backoff);
        continue;
      }
      throw lastErr;
    }
  }
  throw lastErr ?? new Error("Unknown fetch error");
}
