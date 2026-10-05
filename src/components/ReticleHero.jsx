export default function ReticleHero({ statLabel = "LIVE TRACKED PAIRS", statValue = "—" }) {
  return (
    <div className="relative flex flex-col items-center justify-center py-16 grid-fade">
      <div className="relative h-64 w-64 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-nexus-accent/20 animate-[spin_18s_linear_infinite]" />
        <div className="absolute inset-6 rounded-full border border-nexus-accent/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-px w-full bg-nexus-accent/15" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-px h-full bg-nexus-accent/15" />
        </div>
        {/* corner ticks, like a targeting reticle */}
        {["-top-1 -left-1", "-top-1 -right-1", "-bottom-1 -left-1", "-bottom-1 -right-1"].map(
          (pos) => (
            <div key={pos} className={`absolute ${pos} h-3 w-3 border-nexus-accent`} />
          )
        )}
        <div className="relative z-10 text-center">
          <p className="font-mono text-4xl font-bold text-nexus-accent">{statValue}</p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-nexus-muted">
            {statLabel}
          </p>
        </div>
      </div>

      <h1 className="mt-10 font-display text-4xl md:text-5xl font-bold text-center">
        NEXUS <span className="text-nexus-accent">SOL</span> BOT
      </h1>
      <p className="mt-3 text-nexus-muted text-center max-w-md">
        Non-custodial Solana sniping. Your keys never leave your wallet — ours generates a fresh
        one, you stay in control.
      </p>
    </div>
  );
}
