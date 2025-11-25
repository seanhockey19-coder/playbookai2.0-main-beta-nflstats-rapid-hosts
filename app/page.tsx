// app/page.tsx
// NFL Dashboard (main)
export default function DashboardPage() {
  // You can plug your real game data / props into these later.
  const mockGame = {
    home: "Las Vegas Raiders",
    away: "Dallas Cowboys",
    spreadHome: "+19.5 (-145)",
    spreadAway: "-19.5 (-145)",
    totalOver: "58.5 (-145)",
    totalUnder: "58.5 (114)",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
          NFL Dashboard
        </h1>
        <p className="text-sm text-slate-400">
          Live matchup breakdown, AI picks, value scan and player props for
          today&apos;s games.
        </p>
      </header>

      {/* Game selector placeholder */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 md:p-5">
        <label className="block text-xs font-semibold text-slate-400 mb-2">
          GAME
        </label>
        {/* Replace this select with your real game dropdown */}
        <select className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100">
          <option>
            {mockGame.away} @ {mockGame.home}
          </option>
        </select>
      </section>

      {/* Main grid */}
      <section className="grid gap-4 lg:gap-6 lg:grid-cols-3">
        {/* GAME BREAKDOWN */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-200">
                Game Breakdown
              </h2>
              <span className="text-[11px] text-cyan-400/80">
                Projected total: 58.5
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Away
                </div>
                <div className="text-base font-semibold text-slate-50">
                  {mockGame.away}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Home
                </div>
                <div className="text-base font-semibold text-slate-50">
                  {mockGame.home}
                </div>
              </div>
            </div>

            <p className="mt-3 text-xs md:text-sm text-slate-400 leading-relaxed">
              Our game model expects a high-tempo, pass-heavy script with both
              offenses pushing the pace. This panel will update as new odds and
              injury news come in.
            </p>
          </div>

          {/* VALUE SCAN */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 md:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200">
                Line Value Scan
              </h2>
              <span className="text-[11px] text-slate-500">
                Based on implied probability
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-3 text-sm">
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 space-y-1">
                <div className="text-[11px] text-slate-500 uppercase">
                  Spread
                </div>
                <div className="text-sm font-semibold text-slate-50">
                  Cowboys {mockGame.spreadAway}
                </div>
                <div className="text-[11px] text-cyan-400">
                  Edge: 4.2% vs market
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 space-y-1">
                <div className="text-[11px] text-slate-500 uppercase">
                  Total
                </div>
                <div className="text-sm font-semibold text-slate-50">
                  OVER {mockGame.totalOver}
                </div>
                <div className="text-[11px] text-cyan-400">
                  Edge: 3.1% vs market
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 space-y-1">
                <div className="text-[11px] text-slate-500 uppercase">
                  Moneyline
                </div>
                <div className="text-sm font-semibold text-slate-50">
                  Raiders +550
                </div>
                <div className="text-[11px] text-amber-300">
                  Upset alert spot
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT-HAND COLUMN */}
        <div className="space-y-4">
          {/* AI PICKS SUMMARY */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 md:p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200">
              AI Picks Snapshot
            </h2>
            <p className="text-xs text-slate-400">
              Quick look at the top AI edges for this matchup. For a full card,
              use the <span className="text-cyan-300">AI Picks</span> tab.
            </p>
            <ul className="space-y-2 text-xs">
              <li className="flex justify-between">
                <span className="text-slate-300">
                  CeeDee Lamb o6.5 receptions
                </span>
                <span className="text-cyan-300">Edge +7%</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-300">
                  Davante Adams o74.5 yards
                </span>
                <span className="text-cyan-300">Edge +5%</span>
              </li>
            </ul>
          </div>

          {/* PROPS STATUS */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 md:p-5">
            <h2 className="text-sm font-semibold text-slate-200 mb-2">
              Props Feed
            </h2>
            <p className="text-xs text-slate-400">
              If you&apos;re seeing an API error here, double-check your{" "}
              <code className="px-1 py-[1px] rounded bg-slate-800 text-[10px]">
                ODDS_API_KEY
              </code>{" "}
              in Vercel &gt; Settings &gt; Environment Variables and redeploy.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
