import { toast } from "./ToastHost";

export default function WalletCard({ wallet }) {
  if (!wallet) return null;

  function copyAddress() {
    navigator.clipboard.writeText(wallet.publicKey);
    toast("Address copied", "success");
  }

  return (
    <div className="relative rounded-2xl border border-nexus-line bg-nexus-panel p-6 overflow-hidden">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border border-nexus-accent/20" />
      <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full border border-nexus-accent/30 translate-x-6 translate-y-6" />

      <p className="text-xs uppercase tracking-[0.2em] text-nexus-muted mb-2">Trading Wallet</p>
      <p className="font-mono text-3xl font-semibold text-nexus-accent">
        {wallet.balanceSol.toFixed(4)} <span className="text-lg text-nexus-muted">SOL</span>
      </p>

      <div className="mt-4 flex items-center gap-2 rounded-lg bg-nexus-bg border border-nexus-line px-3 py-2">
        <span className="font-mono text-xs text-nexus-muted truncate">{wallet.publicKey}</span>
        <button
          onClick={copyAddress}
          className="shrink-0 text-xs font-medium text-nexus-accent2 hover:text-nexus-accent transition-colors"
        >
          Copy
        </button>
      </div>
    </div>
  );
}
