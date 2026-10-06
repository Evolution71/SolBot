import { useEffect, useState } from "react";
import { api, useAuth, usePoll, useToast } from "../lib.jsx";
import { ExitFields, Field, Num, Switch, Upgrade, WalletPick, exitBody, exitFrom } from "../components/ui.jsx";
import { Activity } from "./Dashboard.jsx";

const NUMERIC = ["buy_sol", "slippage_bps", "max_open_positions", "min_liquidity_usd", "max_liquidity_usd",
                 "max_age_minutes", "min_safety_score", "max_top10_pct", "priority_lamports"];

export default function Sniper() {
  const { user } = useAuth();
  const toast = useToast();
  const { data } = usePoll("/api/sniper/config");
  const { data: act } = usePoll("/api/sniper/activity", 5000);
  const { data: wallets } = usePoll("/api/wallet");
  const [cfg, setCfg] = useState(null);
  const [rules, setRules] = useState(null);
  const [busy, setBusy] = useState(false);
  const L = user.limits;

  const load = (d) => { setCfg(d); setRules(exitFrom(d)); };
  useEffect(() => { if (data) load(data); }, [data]);
  if (!cfg || !rules) return <div className="empty">Loading...</div>;
  const set = (k) => (v) => setCfg({ ...cfg, [k]: v });

  const save = async (next = cfg) => {
    setBusy(true);
    try {
      const { allowed, tp_pct, tp_levels, sl_pct, trailing_pct, rug_exit_pct, ...body } = next;
      for (const k of NUMERIC) body[k] = body[k] ?? 0;
      load(await api("/api/sniper/config", { method: "PUT", body: { ...body, ...exitBody(rules, L) } }));
      toast(next.enabled ? "Auto-sniper armed with these settings" : "Settings saved");
    } catch (e) {
      toast(e.message, "error");
      setCfg({ ...next, enabled: data.enabled });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div><h1>Auto-Sniper</h1><p>The engine buys new pools that pass every filter below, then manages the exit.</p></div>
        <div className="row">
          <span className={`chip ${cfg.enabled ? "acc" : ""}`}>{cfg.enabled ? <><span className="dot" />ARMED</> : "STOPPED"}</span>
          <Switch checked={cfg.enabled} disabled={!L.auto_snipe || busy} onChange={(v) => save({ ...cfg, enabled: v })} />
        </div>
      </div>
      {!L.auto_snipe && <Upgrade text={user.trial_available ? `The auto-sniper is on Hunter and above. Try it free for ${user.trial_days} days.` : "The auto-sniper is available on Hunter and above."} />}

      <div className="grid split">
        <div className="stack">
          <div className="panel">
            <div className="panel-head"><h3>Entry</h3></div>
            <div className="panel-body stack">
              <WalletPick wallets={wallets?.wallets} value={cfg.wallet_id} onChange={set("wallet_id")} label="Snipe with wallet" />
              <div className="grid g3">
                <Field label="Buy size (SOL)"><Num value={cfg.buy_sol} onChange={set("buy_sol")} min="0.001" step="0.01" /></Field>
                <Field label="Max slippage %"><Num value={cfg.slippage_bps / 100} onChange={(v) => set("slippage_bps")(Math.round((v ?? 0) * 100))} step="0.5" /></Field>
                <Field label="Max open positions"><Num value={cfg.max_open_positions} onChange={set("max_open_positions")} min="1" step="1" /></Field>
                <Field label="Priority fee (SOL)" hint={L.priority_fees ? null : "Apex+"}>
                  <Num value={cfg.priority_lamports / 1e9} onChange={(v) => set("priority_lamports")(Math.round((v ?? 0) * 1e9))} step="0.0001" disabled={!L.priority_fees} />
                </Field>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head"><h3>Safety filters</h3></div>
            <div className="panel-body stack">
              <div className="grid g3">
                <Field label="Min liquidity (USD)"><Num value={cfg.min_liquidity_usd} onChange={set("min_liquidity_usd")} step="1000" /></Field>
                <Field label="Max liquidity (USD)" hint="0 = none"><Num value={cfg.max_liquidity_usd} onChange={set("max_liquidity_usd")} step="1000" /></Field>
                <Field label="Max pool age (minutes)"><Num value={cfg.max_age_minutes} onChange={set("max_age_minutes")} min="1" step="1" /></Field>
                <Field label="Min safety score (0-100)"><Num value={cfg.min_safety_score} onChange={set("min_safety_score")} min="0" max="100" step="5" /></Field>
                <Field label="Max top-10 holders %"><Num value={cfg.max_top10_pct} onChange={set("max_top10_pct")} min="1" max="100" step="5" /></Field>
              </div>
              <div className="row between"><span>Require mint authority revoked<div className="small mute">Skips tokens whose supply can still be inflated.</div></span><Switch checked={cfg.require_mint_revoked} onChange={set("require_mint_revoked")} /></div>
              <div className="row between"><span>Require freeze authority revoked<div className="small mute">Skips tokens that can freeze your balance.</div></span><Switch checked={cfg.require_freeze_revoked} onChange={set("require_freeze_revoked")} /></div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head"><h3>Exit</h3></div>
            <div className="panel-body"><ExitFields value={rules} onChange={setRules} limits={L} /></div>
          </div>
          <button className="btn primary lg" disabled={busy} onClick={() => save()}>{busy ? "Saving..." : "Save settings"}</button>
        </div>

        <div className="panel" style={{ alignSelf: "start" }}>
          <div className="panel-head"><h3>Activity</h3><span className="chip">LAST 100</span></div>
          <Activity events={act?.events} />
        </div>
      </div>
    </>
  );
}
