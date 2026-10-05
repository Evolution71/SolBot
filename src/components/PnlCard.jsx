export default function PnlCard({ pnl }) {
  if (!pnl) return null;
  const { totalRealizedPnlSol, totalUnrealizedPnlUsd, positions } = pnl;
  const positive = totalRealizedPnlSol >= 0;

  return (
    <div className="rounded-2xl border border-nexus-line bg-nexus-panel p-6 md:col-span-2">
      <p className="text-xs uppercase tracking-[0.2em] text-nexus-muted mb-2">
        Realized PNL (FIFO-matched)
      </p>
      <p className={`font-mono text-3xl font-semibold ${positive ? "text-nexus-accent" : "text-nexus-warn"}`}>
        {positive ? "+" : ""}
        {totalRealizedPnlSol.toFixed(4)} <span className="text-lg text-nexus-muted">SOL</span>
      </p>

      {totalUnrealizedPnlUsd != null && (
        <p className="text-sm text-nexus-muted mt-1">
          Open positions currently worth ~${totalUnrealizedPnlUsd.toFixed(2)}
        </p>
      )}

      {positions?.some((p) => p.openTokenAmount > 0.000001) && (
        <div className="mt-4 space-y-1.5">
          {positions
            .filter((p) => p.openTokenAmount > 0.000001)
            .map((p) => (
              <div
                key={p.tokenMint}
                className="flex items-center justify-between text-xs font-mono text-nexus-muted"
              >
                <span className="truncate max-w-[200px]">{p.tokenMint}</span>
                <span>
                  {p.openTokenAmount.toFixed(2)} tokens · cost {p.costBasisSol.toFixed(3)} SOL
                  {p.currentPriceUsd != null && ` · $${p.currentPriceUsd.toFixed(6)}`}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
