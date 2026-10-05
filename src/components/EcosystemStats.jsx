import { useEffect, useState } from "react";
import { api } from "../lib/api";

function formatUsd(value) {
  if (value == null) return "—";
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${value.toLocaleString()}`;
}

export default function EcosystemStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getEcosystemStats()
      .then((res) => !cancelled && setStats(res))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-2xl border border-nexus-line bg-nexus-panel p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-nexus-muted mb-4">Solana Network Activity</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-mono text-2xl font-semibold text-nexus-accent">
            {formatUsd(stats?.solanaDexVolume24hUsd)}
          </p>
          <p className="text-xs text-nexus-muted mt-1">24h DEX Volume</p>
        </div>
        <div>
          <p className="font-mono text-2xl font-semibold text-nexus-accent2">{formatUsd(stats?.solanaTvlUsd)}</p>
          <p className="text-xs text-nexus-muted mt-1">Total Value Locked</p>
        </div>
      </div>
      <p className="text-[10px] text-nexus-muted mt-4">
        Source: {stats?.source ?? "DefiLlama"} — refreshed live, not estimated.
      </p>
    </div>
  );
}
