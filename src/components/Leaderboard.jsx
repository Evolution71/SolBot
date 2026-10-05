export default function Leaderboard({ entries }) {
  return (
    <div className="rounded-2xl border border-nexus-line bg-nexus-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-nexus-muted">Weekly Leaderboard</p>
        <span className="text-xs font-mono text-nexus-accent">7D VOLUME</span>
      </div>

      {(!entries || entries.length === 0) && (
        <p className="text-sm text-nexus-muted py-6 text-center">
          No trades tracked this week yet. First on the board wins the crosshair.
        </p>
      )}

      <ol className="space-y-1">
        {entries?.map((e, i) => (
          <li
            key={e.telegramUserId}
            className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-nexus-bg transition-colors"
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-6 text-right font-mono text-sm ${
                  i === 0 ? "text-nexus-accent" : "text-nexus-muted"
                }`}
              >
                {i + 1}
              </span>
              <span className="text-sm text-nexus-text">
                {e.handle ? `@${e.handle}` : `User ${e.telegramUserId.slice(-4)}`}
              </span>
            </div>
            <div className="text-right">
              <span className="font-mono text-sm text-nexus-accent">
                {e.solVolume.toFixed(2)} SOL
              </span>
              <span className="ml-2 text-xs text-nexus-muted">{e.tradeCount} trades</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
