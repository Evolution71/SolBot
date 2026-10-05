import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Wallet as WalletIcon, KeyRound } from "lucide-react";
import { api } from "../lib/api";
import TermsGate from "./TermsGate";
import ExecutionParameters from "./ExecutionParameters";
import StrategyPresets from "./StrategyPresets";

export default function SettingsPage() {
  const [summary, setSummary] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    api.getMySummary().then(setSummary).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-nexus-text">
        <SettingsIcon size={18} />
        <h2 className="font-display text-lg font-semibold">Settings</h2>
      </div>

      <TermsGate>
        <div className="space-y-6">
          {summary?.wallet && (
            <div className="rounded-2xl border border-nexus-line bg-nexus-panel p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-nexus-muted mb-4 flex items-center gap-2">
                <WalletIcon size={14} /> Account
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="font-mono text-xs text-nexus-muted truncate max-w-[220px]">
                  {summary.wallet.publicKey}
                </span>
                <span className="font-mono text-nexus-accent">{summary.wallet.balanceSol.toFixed(4)} SOL</span>
              </div>
              <p className="text-xs text-nexus-muted mt-4 flex items-center gap-1.5">
                <KeyRound size={12} /> Export your private key anytime via{" "}
                <code className="text-nexus-text">/export</code> in Telegram — you're never locked in.
              </p>
            </div>
          )}

          <StrategyPresets onApplied={() => setRefreshKey((k) => k + 1)} />
          <ExecutionParameters key={refreshKey} />
        </div>
      </TermsGate>
    </div>
  );
}
