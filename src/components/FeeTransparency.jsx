const FEE_WALLET = "469rxFHREhqpKcDBugswHFzvuCpuqzWhcSyWfvY8TrL3";

export default function FeeTransparency() {
  return (
    <section className="max-w-3xl mx-auto px-6 py-16 text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-nexus-accent mb-3">Transparency</p>
      <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
        Every fee, on-chain, verifiable by anyone
      </h2>
      <p className="text-nexus-muted max-w-xl mx-auto mb-6">
        CrystalSolTrades takes a small, published fee on every trade — never a hidden cut, never a
        separate silent transaction. It settles atomically inside your trade itself, straight to
        this wallet. Don't take our word for it — check it yourself.
      </p>

      <div className="inline-flex flex-col items-center gap-3 rounded-2xl border border-nexus-line bg-nexus-panel px-6 py-5">
        <span className="text-xs text-nexus-muted uppercase tracking-wide">Fee collection wallet</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm md:text-base text-nexus-text break-all">{FEE_WALLET}</span>
          <button
            onClick={() => navigator.clipboard.writeText(FEE_WALLET)}
            className="shrink-0 text-xs font-medium text-nexus-accent2 hover:text-nexus-accent transition-colors"
          >
            Copy
          </button>
        </div>
        <a
          href={`https://solscan.io/account/${FEE_WALLET}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-nexus-accent underline underline-offset-2"
        >
          View live on Solscan →
        </a>
      </div>
    </section>
  );
}
