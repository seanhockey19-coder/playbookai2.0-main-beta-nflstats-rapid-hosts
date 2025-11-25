export function getPlayerHeadshot(name: string): string {
  const encoded = encodeURIComponent(name.trim());
  return `https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/${encoded}.png`;
}
