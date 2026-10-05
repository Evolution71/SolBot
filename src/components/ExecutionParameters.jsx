import { useEffect, useState } from "react";
import { api } from "../lib/api";

const RISK_LEVELS = ["low", "medium", "high"];

export default function ExecutionParameters() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [needsAccept, setNeedsAccept] = useState(false);

  useEffect(() => {
    api.getAutopilotSettings().then(setSettings).catch((err) => setError(err.message));
  }, []);

  async function patch(fields) {
    setError(null);
    setSaving(true);
    try {
      const updated = await api.updateAutopilotSettings(fields);
      setSettings(updated);
      setNeedsAccept(false);
    } catch (err) {
      if (err.message?.includes("risk disclosure")) {
        setNeedsAccept(true);
      } else {
        setError(err.message);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleAccept() {
    await api.acceptAutopilotTerms();
    setNeedsAccept(false);
    patch({ enabled: true });
  }

  if (!settings) return null;

  return (
    <div className="rounded-2xl border border-nexus-line bg-nexus-panel p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-nexus-muted">Execution Parameters</p>
        <button
          onClick={() => patch({ enabled: !settings.enabled })}
          disabled={saving}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
            settings.enabled
              ? "bg-nexus-accent/15 text-nexus-accent"
              : "bg-nexus-warn/15 text-nexus-warn"
          }`}
        >
          Autopilot: {settings.enabled ? "ON" : "OFF"}
        </button>
      </div>

      {needsAccept && (
        <div className="mb-5 rounded-lg border border-nexus-warn/40 bg-nexus-warn/5 p-4">
          <p className="text-xs text-nexus-text mb-3">
            Autopilot buys automatically with no per-trade confirmation, and can lose your entire
            configured budget even on tokens that pass every risk check. Confirm you understand
            before enabling it.
          </p>
          <button
            onClick={handleAccept}
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-nexus-warn text-nexus-bg"
          >
            I Understand — Enable Autopilot
          </button>
        </div>
      )}

      <div className="space-y-5">
        <ParamSlider
          label="Buy per token"
          unit="SOL"
          value={settings.maxBuySol}
          min={0.01}
          max={2}
          step={0.01}
          onCommit={(v) => patch({ maxBuySol: v })}
        />
        <ParamSlider
          label="Total budget"
          unit="SOL"
          value={settings.budgetSol}
          min={0.05}
          max={10}
          step={0.05}
          onCommit={(v) => patch({ budgetSol: v })}
        />
        <ParamSlider
          label="Take-profit"
          unit="%"
          value={settings.takeProfitPct}
          min={5}
          max={300}
          step={5}
          onCommit={(v) => patch({ takeProfitPct: v })}
        />
        <ParamSlider
          label="Stop-loss"
          unit="%"
          value={settings.stopLossPct}
          min={5}
          max={90}
          step={5}
          onCommit={(v) => patch({ stopLossPct: v })}
        />

        <div>
          <p className="text-xs text-nexus-muted mb-2">Max risk accepted</p>
          <div className="flex gap-2">
            {RISK_LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => patch({ maxRiskLevel: level })}
                className={`flex-1 text-xs font-medium py-2 rounded-lg border transition-colors ${
                  settings.maxRiskLevel === level
                    ? "border-nexus-accent text-nexus-accent bg-nexus-accent/10"
                    : "border-nexus-line text-nexus-muted"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-nexus-muted mt-5">
        Budget spent: {settings.spentSol.toFixed(4)} / {settings.budgetSol} SOL
      </p>

      {error && <p className="text-xs text-nexus-warn mt-3">{error}</p>}
    </div>
  );
}

function ParamSlider({ label, unit, value, min, max, step, onCommit }) {
  const [local, setLocal] = useState(value);

  useEffect(() => setLocal(value), [value]);

  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-nexus-muted">{label}</span>
        <span className="font-mono text-nexus-text">
          {local} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={local}
        onChange={(e) => setLocal(Number(e.target.value))}
        onMouseUp={(e) => onCommit(Number(e.target.value))}
        onTouchEnd={(e) => onCommit(Number(e.target.value))}
        className="w-full accent-nexus-accent"
      />
    </div>
  );
}
