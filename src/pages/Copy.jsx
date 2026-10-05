import { useState } from "react";
import { api, short, usePoll, useToast } from "../lib.jsx";
import { Field, Num, Switch, Upgrade } from "../components/ui.jsx";

const BLANK = { address: "", label: "", buy_sol: 0.05, copy_sells: true, slippage_bps: 1500, enabled: true };

export default function Copy() {
  const toast = useToast();
  const { data, reload } = usePoll("/api/copy/targets");
  const [form, setForm] = useState(BLANK);
  const [busy, setBusy] = useState(false);
  const limit = data?.limit ?? 0;
  const targets = data?.targets ?? [];

  const add = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/api/copy/targets", { method: "POST", body: { ...form, address: form.address.trim() } });
      toast("Wallet added. Its next trades will be mirrored.");
      setForm(BLANK);
      reload();
    } catch (err) { toast(err.message, "error"); } finally { setBusy(false); }
  };
  const update = async (t, patch) => {
    try { await api(`/api/copy/targets/${t.id}`, { method: "PATCH", body: { ...t, ...patch } }); reload(); }
    catch (err) { toast(err.message, "error"); }
  };
  const remove = async (t) => {
    try { await api(`/api/copy/targets/${t.id}`, { method: "DELETE" }); reload(); }
    catch (err) { toast(err.message, "error"); }
  };

  return (
    <>
      <div className="page-head">
        <div><h1>Copy Trade</h1><p>Mirror the buys and sells of any Solana wallet with your own position size.</p></div>
        <span className="chip">{targets.length} / {limit} WALLETS</span>
      </div>
      {data && limit === 0 && <Upgrade text="Copy trading is available on Hunter and above." />}

      <div className="grid split">
        <div className="panel">
          <div className="panel-head"><h3>Wallets you copy</h3></div>
          <div className="table-wrap">
            {targets.length ? (
              <table>
                <thead><tr><th>Wallet</th><th className="right">Buy size</th><th>Copy sells</th><th>Active</th><th /></tr></thead>
                <tbody>
                  {targets.map((t) => (
                    <tr key={t.id}>
                      <td><b>{t.label || "Unnamed"}</b><div className="mono small dim"><a href={`https://solscan.io/account/${t.address}`} target="_blank" rel="noreferrer">{short(t.address, 6)}</a></div></td>
                      <td className="right mono">{t.buy_sol} SOL</td>
                      <td><Switch checked={t.copy_sells} onChange={(v) => update(t, { copy_sells: v })} /></td>
                      <td><Switch checked={t.enabled} onChange={(v) => update(t, { enabled: v })} /></td>
                      <td className="right"><button className="btn sm danger" onClick={() => remove(t)}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div className="empty">You are not copying any wallet yet.</div>}
          </div>
        </div>

        <form className="panel" onSubmit={add} style={{ alignSelf: "start" }}>
          <div className="panel-head"><h3>Add a wallet</h3></div>
          <div className="panel-body stack">
            <Field label="Wallet address"><input className="input mono" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Solana address" /></Field>
            <Field label="Label" hint="optional"><input className="input" maxLength={48} value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g. Smart money #1" /></Field>
            <div className="grid g2">
              <Field label="Your buy size (SOL)"><Num value={form.buy_sol} onChange={(v) => setForm({ ...form, buy_sol: v })} min="0.001" step="0.01" /></Field>
              <Field label="Max slippage %"><Num value={form.slippage_bps / 100} onChange={(v) => setForm({ ...form, slippage_bps: Math.round((v ?? 0) * 100) })} step="0.5" /></Field>
            </div>
            <div className="row between"><span>Also copy their sells</span><Switch checked={form.copy_sells} onChange={(v) => setForm({ ...form, copy_sells: v })} /></div>
            <button className="btn primary block" disabled={busy || limit === 0 || targets.length >= limit}>{busy ? "Adding..." : "Start copying"}</button>
            <p className="small dim">Copying starts from the wallet's next trade. Past performance of a wallet says nothing certain about its future trades.</p>
          </div>
        </form>
      </div>
    </>
  );
}
