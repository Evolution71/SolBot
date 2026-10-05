import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Wallet, ShieldCheck, LineChart } from "lucide-react";
import { api } from "../lib/api";

export default function QuickStartCard({ onNavigate }) {
  const [state, setState] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.getMySummary(), api.getTermsStatus()])
      .then(([summary, terms]) => {
        if (cancelled) return;
        setState({
          funded: summary.wallet.balanceSol > 0,
          accepted: terms.accepted,
          traded: summary.trades.totalTrades > 0,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!state || (state.funded && state.accepted && state.traded)) return null; // fully onboarded — no need to show this

  const steps = [
    { key: "funded", icon: Wallet, label: "Fund your wallet", tab: "overview" },
    { key: "accepted", icon: ShieldCheck, label: "Accept the risk disclosure", tab: "settings" },
    { key: "traded", icon: LineChart, label: "Make your first trade", tab: "trade" },
  ];

  return (
    <div className="rounded-2xl border border-nexus-accent/30 bg-nexus-accent/5 p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-nexus-accent mb-4">Quick Start</p>
      <div className="space-y-3">
        {steps.map((step) => {
          const done = state[step.key];
          const Icon = step.icon;
          return (
            <button
              key={step.key}
              onClick={() => !done && onNavigate?.(step.tab)}
              disabled={done}
              className="w-full flex items-center gap-3 text-left disabled:cursor-default"
            >
              {done ? (
                <CheckCircle2 size={18} className="text-nexus-accent shrink-0" />
              ) : (
                <Circle size={18} className="text-nexus-muted shrink-0" />
              )}
              <Icon size={15} className={done ? "text-nexus-muted" : "text-nexus-text"} />
              <span className={`text-sm ${done ? "text-nexus-muted line-through" : "text-nexus-text"}`}>
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
