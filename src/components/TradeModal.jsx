import { useState } from "react";
import { age, api, pct, price, tone, usd, useAuth, usePoll, useToast } from "../lib.jsx";
import { CopyBox, Field, Modal, Num, Score, TokenCell } from "./ui.jsx";

const PRESETS = [0.05, 0.1, 0.5, 1];

export default function TradeModal({ mint, onClose, onDone }) {
  const { user } = useAuth();
  const toast = useToast();
  const { data, error } = usePoll(`/api/market/token/${mint}`, 6000);
  const [amount, setAmount] = useState(0.1);
  const [slippage, setSlippage] = useState(15);
  const [tp, setTp] = useState(null);
  const [sl, setSl] = useState(null);
  const [trail, setTrail] = useState(null);
  const [busy, setBusy] = useState(false);
  const L = user.limits;

  const buy = async () => {
    setBusy(true);
    try {
      const t = await api("/api/trade/buy", { method: "POST", body: {
        mint, sol: amount, slippage_bps: Math.round(slippage * 100),
        tp_pct: L.tp_sl ? tp : null, sl_pct: L.tp_sl ? sl : null, trailing_pct: L.trailing ? trail : null } });
      toast(`Bought ${t.symbol} for ${t.sol} SOL`);
      onDone?.();
      onClose();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const t = data?.token;
  const fee = (amount || 0) * user.fee_bps / 10000;
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
            <Field label="Amount (SOL)">
              <Num value={amount} onChange={setAmount} min="0.001" step="0.01" />
            </Field>
            <div className="row wrap">
              {PRESETS.map((p) => <button key={p} className={`btn sm ${amount === p ? "primary" : ""}`} onClick={() => setAmount(p)}>{p} SOL</button>)}
            </div>
            <Field label="Max slippage %"><Num value={slippage} onChange={setSlippage} min="0.1" max="50" step="0.5" /></Field>
            <div className="grid g2">
              <Field label="Take-profit %" hint={L.tp_sl ? null : "Hunter+"}><Num value={tp} onChange={setTp} disabled={!L.tp_sl} placeholder="e.g. 50" /></Field>
              <Field label="Stop-loss %" hint={L.tp_sl ? null : "Hunter+"}><Num value={sl} onChange={setSl} disabled={!L.tp_sl} placeholder="e.g. 25" /></Field>
            </div>
            <Field label="Trailing stop %" hint={L.trailing ? null : "Apex+"}><Num value={trail} onChange={setTrail} disabled={!L.trailing} placeholder="e.g. 20" /></Field>
            <div className="row between small mute">
              <span>Platform fee ({(user.fee_bps / 100).toFixed(2)}%)</span><span className="mono">{fee.toFixed(5)} SOL</span>
            </div>
            <button className="btn primary lg block" disabled={busy || !amount} onClick={buy}>
              {busy ? "Sending..." : `Buy ${t.symbol}`}
            </button>
            <p className="small dim">New tokens are extremely risky and most go to zero. A safety score lowers risk, it does not remove it.</p>
          </div>
        </div>
      )}
    </Modal>
  );
}
