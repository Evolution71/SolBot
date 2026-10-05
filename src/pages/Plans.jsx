import { useState } from "react";
import { api, sol, toDate, useAuth, usePoll, useToast, when } from "../lib.jsx";
import { CopyBox, Field, Modal, solscan } from "../components/ui.jsx";

function Checkout({ invoice, onClose, onPaid }) {
  const toast = useToast();
  const [sig, setSig] = useState("");
  const [busy, setBusy] = useState("");
  const settle = (name, call) => async (e) => {
    e?.preventDefault();
    setBusy(name);
    try { await call(); toast(`${invoice.plan_name} is now active`); onPaid(); onClose(); }
    catch (err) { toast(err.message, "error"); } finally { setBusy(""); }
  };
  const fromWallet = settle("wallet", () => api(`/api/billing/invoice/${invoice.id}/pay`, { method: "POST" }));
  const verify = settle("verify", () => api(`/api/billing/invoice/${invoice.id}/verify`, { method: "POST", body: { signature: sig.trim() } }));

  return (
    <Modal onClose={onClose}>
      <div className="panel-head"><h3>Pay for {invoice.plan_name}</h3><button className="btn sm ghost" onClick={onClose}>Close</button></div>
      <div className="panel-body stack">
        <div className="row between"><span className="mute">Amount due (${invoice.usd})</span><b className="mono" style={{ fontSize: 20 }}>{sol(invoice.sol, 9)} SOL</b></div>
        <button className="btn primary lg block" disabled={!!busy} onClick={fromWallet}>{busy === "wallet" ? "Paying..." : "Pay from my trading wallet"}</button>
        <div className="eyebrow" style={{ textAlign: "center" }}>or pay from another wallet</div>
        <Field label="1. Send exactly this amount"><CopyBox value={invoice.sol.toFixed(9)} label="Amount copied" /></Field>
        <Field label="2. To this address (Solana network)"><CopyBox value={invoice.treasury} label="Address copied" /></Field>
        <form className="stack" onSubmit={verify}>
          <Field label="3. Paste the transaction signature"><input className="input mono" required value={sig} onChange={(e) => setSig(e.target.value)} placeholder="Transaction signature / hash" /></Field>
          <button className="btn block" disabled={!!busy}>{busy === "verify" ? "Checking on-chain..." : "Verify payment"}</button>
        </form>
        <p className="small dim">The amount is unique to this invoice, so send it exactly, including every decimal. Sending from an exchange that deducts a withdrawal fee from the amount will not match. Price is locked until {when(invoice.expires_at)}.</p>
      </div>
    </Modal>
  );
}

export default function Plans() {
  const { user, refresh } = useAuth();
  const toast = useToast();
  const { data } = usePoll("/api/billing/plans");
  const payments = usePoll("/api/billing/payments");
  const [invoice, setInvoice] = useState(null);
  const [busy, setBusy] = useState("");
  const current = data?.plans.find((p) => p.id === user.plan);

  const choose = async (plan) => {
    setBusy(plan.id);
    try { setInvoice(await api("/api/billing/invoice", { method: "POST", body: { plan: plan.id } })); }
    catch (e) { toast(e.message, "error"); } finally { setBusy(""); }
  };

  return (
    <>
      <div className="page-head">
        <div><h1>Plans</h1><p>Paid in SOL, verified on-chain, active for {data?.days ?? 30} days.</p></div>
        <span className="chip acc">CURRENT: {user.plan_name.toUpperCase()}{user.plan !== "free" && user.plan_expires_at ? ` · UNTIL ${toDate(user.plan_expires_at).toLocaleDateString()}` : ""}</span>
      </div>

      <div className="plans">
        {(data?.plans || []).map((p) => {
          const mine = p.id === user.plan;
          const lower = current && p.rank < current.rank;
          return (
            <div key={p.id} className={`plan ${p.id === "elite" ? "hot" : ""}`}>
              <div className="row between"><h3>{p.name}</h3>{mine && <span className="chip acc">YOUR PLAN</span>}</div>
              <div className="price">${p.price_usd}<small>{p.price_usd ? " / 30 days" : " forever"}</small></div>
              <p className="mute small">{p.price_usd && data.sol_usd ? `≈ ${(p.price_usd / data.sol_usd).toFixed(3)} SOL · ` : ""}{p.tagline}</p>
              <ul>{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
              {p.price_usd === 0
                ? <button className="btn block" disabled>{mine ? "Active" : "Included"}</button>
                : <button className={`btn block ${p.id === "elite" ? "primary" : ""}`} disabled={busy === p.id || lower} onClick={() => choose(p)}>
                    {busy === p.id ? "Preparing..." : mine ? "Extend 30 days" : lower ? "Below your plan" : `Upgrade to ${p.name}`}
                  </button>}
            </div>
          );
        })}
      </div>

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="panel-head"><h3>Payment history</h3></div>
        <div className="table-wrap">
          {payments.data?.payments?.length ? (
            <table>
              <thead><tr><th>Date</th><th>Plan</th><th className="right">USD</th><th className="right">SOL</th><th>Status</th><th className="right">Tx</th></tr></thead>
              <tbody>
                {payments.data.payments.map((p) => (
                  <tr key={p.id}>
                    <td className="mono small mute">{when(p.created_at)}</td><td>{p.plan_name}</td>
                    <td className="right mono">${p.usd}</td><td className="right mono">{sol(p.sol, 6)}</td>
                    <td><span className={`chip ${p.status === "confirmed" ? "acc" : ""}`}>{p.status.toUpperCase()}</span></td>
                    <td className="right">{p.signature ? <a className="chip" href={solscan(p.signature)} target="_blank" rel="noreferrer">View</a>
                      : <button className="btn sm" onClick={() => setInvoice(p)}>Pay</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div className="empty">No payments yet.</div>}
        </div>
      </div>

      {invoice && <Checkout invoice={invoice} onClose={() => { setInvoice(null); payments.reload(); }} onPaid={() => { refresh(); payments.reload(); }} />}
    </>
  );
}
