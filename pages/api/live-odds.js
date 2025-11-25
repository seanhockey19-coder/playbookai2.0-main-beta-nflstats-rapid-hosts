export default function handler(_req, res) {
  res.status(410).json({
    error: "Deprecated route. Use /api/nfl/games and /api/{nfl|nba}/props in the App Router.",
  });
}
