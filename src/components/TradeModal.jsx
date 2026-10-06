import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { age, api, pct, price, tone, usd, useAuth, usePoll, useToast } from "../lib.jsx";
import { CopyBox, ExitFields, Field, Modal, Num, Score, TokenCell, WalletPick, exitBody } from "./ui.jsx";

const PRESETS = [0.05, 0.1, 0.5, 1];
const INTERVALS = [[5, "5 min"], [15, "15 min"], [60, "1 hour"], [240, "4 hours"], [1440, "1 day"]];
const MODES = [["market", "Market"], ["limit", "Limit"], ["dca", "DCA"]];

export default function TradeModal({ mint, onClose, onDone }) {
  const { user } = useAuth();
  const toast = useToast();
  const { data, error } = usePoll(`/api/market/token/${mint}`, 6000);
  const { data: wallets } = usePoll("/api/wallet");
  const L = user.limits;

  const [mode, setMode] = useState("market");
  const [walletId, setWalletId] = useState(null);
  const [amount, setAmount] = useState(0.1);
  const [slippage, setSlippage] = useState(15);
  const [rules, setRules] = useState({ tp_levels: [], sl_pct: null, trailing_pct: null, rug_exit_pct: null });
  const [target, setTarget] = useState(null);       // limit: buy at or below; dca: optional ceiling
  const [ladder, setLadder] = useState(1);
  const [step, setStep] = useState(10);
  const [expires, setExpires] = useState(24);
  const [count, setCount] = useState(5);
  const [interval, setInterval_] = useState(60);
  const [busy, setBusy] = useState(false);

  const t = data?.token;
  useEffect(() => {
    if (wallets && walletId == null) setWalletId(wallets.wallets.find((w) => w.is_default)?.id ?? wallets.wallets[0]?.id);
  }, [wallets, walletId]);
  useEffect(() => {
    if (t && target == null && mode === "limit") setTarget(Number((t.price_usd * 0.9).toPrecision(4)));
  }, [t, mode, target]);

  const ordersOk = L.orders > 0;
  const blocked = mode !== "market" && !ordersOk;
  const total = mode === "dca" ? (amount || 0) * (count || 0) : mode === "limit" ? (amount || 0) * (ladder || 1) : amount || 0;
  const fee = total * user.fee_bps / 10000;

  const submit = async () => {
    setBusy(true);
    try {
      const common = { mint, wallet_id: walletId, slippage_bps: Math.round(slippage * 100), ...exitBody(rules, L) };
      if (mode === "market") {
        const r = await api("/api/trade/buy", { method: "POST", body: { ...common, sol: amount } });
        toast(`Bought ${r.symbol} for ${r.sol} SOL`);
      } else if (mode === "limit") {
        const r = await api("/api/orders", { method: "POST", body: {
          ...common, kind: "limit", sol_per_order: amount, trigger_price_usd: target,
          ladder_levels: ladder || 1, ladder_step_pct: step || 10, expires_hours: expires || null } });
        toast(`${r.orders.length} limit order${r.orders.length > 1 ? "s" : ""} placed for ${t.symbol}`);
      } else {
        await api("/api/orders", { method: "POST", body: {
          ...common, kind: "dca", sol_per_order: amount, total_orders: count, interval_minutes: interval,
          trigger_price_usd: target || null } });
        toast(`DCA started: ${count} buys of ${amount} SOL`);
      }
      onDone?.();
      onClose();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal onClose={onClose} wide>
      <div className="panel-head">
        {t ? <TokenCell t={t} /> : <h3>Loading token...</h3>}
        <button className="btn sm ghost" onClick={onClose}>Close</button>
      </div>
      {error && !t && <div className="empty">{error}</div>}
      {t && (
        <div className="panel-body grid g2">
          <div className="stack">
            <div className="grid g2">
              <div><div className="eyebrow">Price</div><b className="mono">{price(t.price_usd)}</b></div>
              <div><div className="eyebrow">1h</div><b className={`mono ${tone(t.change_h1)}`}>{pct(t.change_h1)}</b></div>
              <div><div className="eyebrow">Liquidity</div><b className="mono">{usd(t.liquidity_usd)}</b></div>
              <div><div className="eyebrow">Market cap</div><b className="mono">{usd(t.market_cap)}</b></div>
              <div><div className="eyebrow">Pool age</div><b className="mono">{age(t.age_minutes)}</b></div>
              <div><div className="eyebrow">Buys / sells 1h</div><b className="mono">{t.buys_h1} / {t.sells_h1}</b></div>
            </div>
            <div className="panel" style={{ background: "var(--bg-2)" }}>
              <div className="panel-body row" style={{ alignItems: "flex-start" }}>
                <Score value={data.safety.score} />
                <div className="stack" style={{ gap: 6 }}>
                  <div className="eyebrow">Rug-risk checks</div>
                  {data.safety.flags.map((f, i) => <div key={i} className={`flag ${f.level}`}><i />{f.text}</div>)}
                </div>
              </div>
            </div>
            <CopyBox value={mint} label="Token address copied" />
            <div className="row small">
              {t.url && <a className="chip" href={t.url} target="_blank" rel="noreferrer">DexScreener chart</a>}
              <a className="chip" href={`https://solscan.io/token/${mint}`} target="_blank" rel="noreferrer">Solscan</a>
            </div>
          </div>

          <div className="stack">
            <div className="tabs block">
              {MODES.map(([id, label]) => <button key={id} className={mode === id ? "on" : ""} onClick={() => setMode(id)}>{label}</button>)}
            </div>
            {blocked && (
              <div className="lock-card" style={{ marginBottom: 0 }}>
                <div><b>Limit orders and DCA are on Hunter and above.</b>
                  <div className="mute small">{user.trial_available ? `Try them free for ${user.trial_days} days.` : "Upgrade to unlock them."}</div></div>
                <Link to="/app/plans" className="btn primary sm" onClick={onClose}>{user.trial_available ? "Start free trial" : "View plans"}</Link>
              </div>
            )}
            <WalletPick wallets={wallets?.wallets} value={walletId} onChange={setWalletId} label="Buy with wallet" />
            <Field label={mode === "market" ? "Amount (SOL)" : "Amount per order (SOL)"}>
              <Num value={amount} onChange={setAmount} min="0.001" step="0.01" />
            </Field>
            <div className="row wrap">
              {PRESETS.map((p) => <button key={p} className={`btn sm ${amount === p ? "primary" : ""}`} onClick={() => setAmount(p)}>{p} SOL</button>)}
            </div>

            {mode === "limit" && (
              <>
                <Field label="Buy when price is at or below (USD)"><Num value={target} onChange={setTarget} step="any" /></Field>
                <div className="row wrap">
                  {[5, 10, 25, 50].map((d) => <button key={d} className="btn sm" onClick={() => setTarget(Number((t.price_usd * (1 - d / 100)).toPrecision(4)))}>-{d}%</button>)}
                </div>
                <div className="grid g3">
                  <Field label="Ladder orders"><Num value={ladder} onChange={setLadder} min="1" max="10" step="1" /></Field>
                  <Field label="Step down %"><Num value={step} onChange={setStep} min="1" max="80" disabled={(ladder || 1) < 2} /></Field>
                  <Field label="Expires (hours)"><Num value={expires} onChange={setExpires} min="1" placeholder="never" /></Field>
                </div>
              </>
            )}
            {mode === "dca" && (
              <>
                <div className="grid g2">
                  <Field label="Number of buys"><Num value={count} onChange={setCount} min="1" max="100" step="1" /></Field>
                  <Field label="Every">
                    <select className="input" value={interval} onChange={(e) => setInterval_(Number(e.target.value))}>
                      {INTERVALS.map(([m, label]) => <option key={m} value={m}>{label}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Only buy at or below (USD)" hint="optional"><Num value={target} onChange={setTarget} step="any" placeholder="any price" /></Field>
              </>
            )}

            <Field label="Max slippage %"><Num value={slippage} onChange={setSlippage} min="0.1" max="50" step="0.5" /></Field>
            <ExitFields value={rules} onChange={setRules} limits={L} />
            <div className="row between small mute">
              <span>{mode === "market" ? "Platform fee" : `Total ${total.toFixed(3)} SOL, fee`} ({(user.fee_bps / 100).toFixed(2)}%)</span>
              <span className="mono">{fee.toFixed(5)} SOL</span>
            </div>
            <button className="btn primary lg block" disabled={busy || !amount || blocked || (mode === "limit" && !target)} onClick={submit}>
              {busy ? "Sending..." : mode === "market" ? `Buy ${t.symbol}` : mode === "limit" ? `Place limit order${(ladder || 1) > 1 ? "s" : ""}` : "Start DCA"}
            </button>
            <p className="small dim">New tokens are extremely risky and most go to zero. A safety score lowers risk, it does not remove it.</p>
          </div>
        </div>
      )}
    </Modal>
  );
}
