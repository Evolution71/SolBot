import { useEffect, useState } from "react";
import { api } from "../lib/api";

const RISK_COLOR = {
  low: "text-nexus-accent bg-nexus-accent/10",
  medium: "text-yellow-400 bg-yellow-400/10",
  high: "text-nexus-warn bg-nexus-warn/10",
};

function timeAgo(iso) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

export default function LiveFeed({ limit = 10, title = "Live Token Feed" }) {
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await api.getFeed(limit);
        if (!cancelled) setEntries(res.entries);
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    }

    load();
    const interval = setInterval(load, 15000); // refresh every 15s
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [limit]);

  return (
    <div className="rounded-2xl border border-nexus-line bg-nexus-panel overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-nexus-line">
        <p className="text-xs uppercase tracking-[0.2em] text-nexus-muted">{title}</p>
        <span className="flex items-center gap-1.5 text-xs text-nexus-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-nexus-accent animate-pulse" />
          Live
        </span>
      </div>

      {error && <p className="text-xs text-nexus-warn text-center py-8">{error}</p>}

      {!error && entries === null && (
        <p className="text-xs text-nexus-muted text-center py-8">Loading detections...</p>
      )}

      {!error && entries?.length === 0 && (
        <p className="text-xs text-nexus-muted text-center py-8">
          No tokens detected yet — this fills in once your Helius webhook is receiving events.
        </p>
      )}

      {entries?.length > 0 && (
        <div className="divide-y divide-nexus-line">
          {entries.map((e) => (
            <div key={`${e.tokenMint}-${e.detectedAt}`} className="flex items-center justify-between px-6 py-3">
              <div className="flex flex-col">
                <span className="font-mono text-xs text-nexus-text truncate max-w-[160px] md:max-w-[240px]">
                  {e.tokenMint}
                </span>
                <span className="text-[10px] text-nexus-muted mt-0.5">{timeAgo(e.detectedAt)}</span>
              </div>
              <div className="flex items-center gap-3">
                {e.liquidityEstimateSol != null && (
                  <span className="text-xs text-nexus-muted hidden sm:inline">
                    ~{e.liquidityEstimateSol.toFixed(1)} SOL liq.
                  </span>
                )}
                <span className={`text-[10px] font-semibold px-2 py-1 rounded ${RISK_COLOR[e.riskLevel]}`}>
                  {e.riskLevel.toUpperCase()} · {e.riskScore}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
