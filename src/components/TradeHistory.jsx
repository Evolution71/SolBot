export default function TradeHistory({ trades }) {
  return (
    <div className="rounded-2xl border border-nexus-line bg-nexus-panel p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-nexus-muted mb-4">Recent Trades</p>

      {(!trades || trades.length === 0) && (
        <p className="text-sm text-nexus-muted py-6 text-center">
          No trades yet. Run <span className="font-mono text-nexus-accent">/snipe</span> in Telegram.
        </p>
      )}

      <div className="space-y-2">
        {trades?.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between rounded-lg border border-nexus-line/60 px-3 py-2.5"
          >
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                  t.side === "buy"
                    ? "bg-nexus-accent/15 text-nexus-accent"
                    : "bg-nexus-warn/15 text-nexus-warn"
                }`}
              >
                {t.side.toUpperCase()}
              </span>
              <span className="font-mono text-xs text-nexus-muted truncate max-w-[140px]">
                {t.token_mint}
              </span>
            </div>
            <span className="font-mono text-sm text-nexus-text">{Number(t.sol_amount).toFixed(3)} SOL</span>
          </div>
        ))}
      </div>
    </div>
  );
}
