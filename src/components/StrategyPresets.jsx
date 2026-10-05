import { api } from "../lib/api";

const PRESETS = [
  {
    name: "Conservative",
    color: "text-nexus-accent",
    description: "Low-risk only, small budget, tight stop-loss.",
    settings: { maxRiskLevel: "low", maxBuySol: 0.03, budgetSol: 0.3, takeProfitPct: 30, stopLossPct: 15 },
  },
  {
    name: "Balanced",
    color: "text-nexus-accent2",
    description: "Medium risk tolerance, moderate budget.",
    settings: { maxRiskLevel: "medium", maxBuySol: 0.05, budgetSol: 0.5, takeProfitPct: 50, stopLossPct: 20 },
  },
  {
    name: "Aggressive",
    color: "text-nexus-warn",
    description: "Higher risk tolerance, larger budget, wider stop-loss.",
    settings: { maxRiskLevel: "high", maxBuySol: 0.1, budgetSol: 1, takeProfitPct: 100, stopLossPct: 35 },
  },
];

export default function StrategyPresets({ onApplied }) {
  async function apply(preset) {
    await api.updateAutopilotSettings(preset.settings);
    onApplied?.();
  }

  return (
    <div className="rounded-2xl border border-nexus-line bg-nexus-panel p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-nexus-muted mb-4">Strategy Presets</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => apply(p)}
            className="text-left rounded-xl border border-nexus-line p-4 hover:border-nexus-accent/50 transition-colors"
          >
            <span className={`text-sm font-semibold ${p.color}`}>{p.name}</span>
            <p className="text-xs text-nexus-muted mt-1.5 leading-relaxed">{p.description}</p>
          </button>
        ))}
      </div>
      <p className="text-[10px] text-nexus-muted mt-4">
        Applies these values to your Execution Parameters above — doesn't enable Autopilot by
        itself, and you can fine-tune any value afterward.
      </p>
    </div>
  );
}
