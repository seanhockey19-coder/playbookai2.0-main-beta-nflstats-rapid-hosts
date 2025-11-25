// Explicit team → ESPN slug mapping for 100% logo accuracy.
// Extend as needed. Keys are lowercase; we normalize input.
export const NFL_LOGO_SLUG: Record<string, string> = {
  // NFC East
  "dallas cowboys": "dal", "cowboys": "dal", "dallas": "dal",
  "new york giants": "nyg", "giants": "nyg",
  "philadelphia eagles": "phi", "eagles": "phi", "philadelphia": "phi",
  "washington commanders": "wsh", "commanders": "wsh", "washington": "wsh",
  // NFC North
  "chicago bears": "chi", "bears": "chi",
  "detroit lions": "det", "lions": "det",
  "green bay packers": "gb", "packers": "gb", "green bay": "gb",
  "minnesota vikings": "min", "vikings": "min",
  // NFC South
  "atlanta falcons": "atl", "falcons": "atl",
  "carolina panthers": "car", "panthers": "car",
  "new orleans saints": "no", "saints": "no",
  "tampa bay buccaneers": "tb", "buccaneers": "tb", "bucs": "tb",
  // NFC West
  "arizona cardinals": "ari", "cardinals": "ari",
  "los angeles rams": "lar", "rams": "lar",
  "san francisco 49ers": "sf", "49ers": "sf", "niners": "sf",
  "seattle seahawks": "sea", "seahawks": "sea",
  // AFC East
  "buffalo bills": "buf", "bills": "buf",
  "miami dolphins": "mia", "dolphins": "mia",
  "new england patriots": "ne", "patriots": "ne", "pats": "ne",
  "new york jets": "nyj", "jets": "nyj",
  // AFC North
  "baltimore ravens": "bal", "ravens": "bal",
  "cincinnati bengals": "cin", "bengals": "cin",
  "cleveland browns": "cle", "browns": "cle",
  "pittsburgh steelers": "pit", "steelers": "pit",
  // AFC South
  "houston texans": "hou", "texans": "hou",
  "indianapolis colts": "ind", "colts": "ind",
  "jacksonville jaguars": "jax", "jaguars": "jax", "jags": "jax",
  "tennessee titans": "ten", "titans": "ten",
  // AFC West
  "denver broncos": "den", "broncos": "den",
  "kansas city chiefs": "kc", "chiefs": "kc",
  "las vegas raiders": "lv", "raiders": "lv",
  "los angeles chargers": "lac", "chargers": "lac"
};

export const NBA_LOGO_SLUG: Record<string, string> = {
  // Atlantic
  "boston celtics": "bos", "celtics": "bos",
  "brooklyn nets": "bkn", "nets": "bkn",
  "new york knicks": "ny", "knicks": "ny",
  "philadelphia 76ers": "phi", "76ers": "phi", "sixers": "phi",
  "toronto raptors": "tor", "raptors": "tor",
  // Central
  "chicago bulls": "chi", "bulls": "chi",
  "cleveland cavaliers": "cle", "cavaliers": "cle", "cavs": "cle",
  "detroit pistons": "det", "pistons": "det",
  "indiana pacers": "ind", "pacers": "ind",
  "milwaukee bucks": "mil", "bucks": "mil",
  // Southeast
  "atlanta hawks": "atl", "hawks": "atl",
  "charlotte hornets": "cha", "hornets": "cha",
  "miami heat": "mia", "heat": "mia",
  "orlando magic": "orl", "magic": "orl",
  "washington wizards": "wsh", "wizards": "wsh",
  // Northwest
  "denver nuggets": "den", "nuggets": "den",
  "minnesota timberwolves": "min", "timberwolves": "min", "wolves": "min",
  "oklahoma city thunder": "okc", "thunder": "okc",
  "portland trail blazers": "por", "trail blazers": "por", "blazers": "por",
  "utah jazz": "uta", "jazz": "uta",
  // Pacific
  "golden state warriors": "gs", "warriors": "gs", "gsw": "gs",
  "los angeles clippers": "lac", "clippers": "lac",
  "los angeles lakers": "lal", "lakers": "lal",
  "phoenix suns": "phx", "suns": "phx",
  "sacramento kings": "sac", "kings": "sac",
  // Southwest
  "dallas mavericks": "dal", "mavericks": "dal", "mavs": "dal",
  "houston rockets": "hou", "rockets": "hou",
  "memphis grizzlies": "mem", "grizzlies": "mem", "grizz": "mem",
  "new orleans pelicans": "no", "pelicans": "no", "pels": "no",
  "san antonio spurs": "sa", "spurs": "sa"
};

export function resolveLogoUrl(sport: "nfl" | "nba", teamName: string): string | null {
  const key = (teamName || "").toLowerCase().trim();
  const slug = sport === "nfl" ? NFL_LOGO_SLUG[key] : NBA_LOGO_SLUG[key];
  if (!slug) return null;
  const base = sport === "nfl"
    ? "https://a.espncdn.com/i/teamlogos/nfl/500"
    : "https://a.espncdn.com/i/teamlogos/nba/500";
  return `${base}/${slug}.png`;
}
