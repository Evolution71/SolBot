import { useState } from "react";
import { api, pct, signed, sol, tone, useAuth, usePoll, useToast, when } from "../lib.jsx";
import ShareCard from "../components/ShareCard.jsx";
import { ExitChips, ExitFields, Icon, Modal, TokenCell, exitBody, exitFrom, solscan } from "../components/ui.jsx";

function Targets({ p, onClose, onSaved }) {
  const { user } = useAuth();
  const toast = useToast();
  const [rules, setRules] = useState(exitFrom(p));
  const save = async () => {
    try {
      await api(`/api/trade/positions/${p.id}`, { method: "PATCH", body: exitBody(rules, user.limits) });
      toast("Exit rules updated");
      onSaved();
      onClose();
    } catch (e) { toast(e.message, "error"); }
  };
  return (
    <Modal onClose={onClose}>
      <div className="panel-head"><h3>Exit rules for {p.symbol}</h3><button className="btn sm ghost" onClick={onClose}>Close</button></div>
      <div className="panel-body stack">
        <ExitFields value={rules} onChange={setRules} limits={user.limits} />
        <button className="btn primary block" onClick={save}>Save</button>
      </div>
    </Modal>
  );
}

export default function Positions() {
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState("open");
  const open = usePoll("/api/trade/positions", 6000, tab === "open");
  const history = usePoll("/api/trade/history", 15000, tab === "history");
  const [busy, setBusy] = useState(null);
  const [edit, setEdit] = useState(null);
  const [share, setShare] = useState(null);
  const rows = open.data?.positions || [];
  const multi = new Set(rows.map((p) => p.wallet)).size > 1 || rows.some((p) => p.wallet !== "Main");

  const sell = async (p, part) => {
    setBusy(p.id);
    try {
      const t = await api("/api/trade/sell", { method: "POST", body: { position_id: p.id, pct: part } });
      toast(`Sold ${part}% of ${t.symbol}: ${signed(t.pnl_sol)} SOL`);
      open.reload();
    } catch (e) { toast(e.message, "error"); } finally { setBusy(null); }
  };

  return (
    <>
      <div className="page-head">
        <div><h1>Positions</h1><p>Manage open trades and review every fill.</p></div>
        <div className="tabs">
          <button className={tab === "open" ? "on" : ""} onClick={() => setTab("open")}>Open</button>
          <button className={tab === "history" ? "on" : ""} onClick={() => setTab("history")}>History</button>
        </div>
      </div>

      <div className="panel"><div className="table-wrap">
        {tab === "open" && (rows.length ? (
          <table>
            <thead><tr><th>Token</th>{multi && <th>Wallet</th>}<th className="right">Cost</th><th className="right">Value</th><th className="right">P&amp;L</th><th>Exit rules</th><th className="right">Sell</th></tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td><TokenCell t={p} /></td>
                  {multi && <td className="small">{p.wallet}</td>}
                  <td className="right mono">{sol(p.cost_sol)}</td>
                  <td className="right mono">{sol(p.value_sol)}</td>
                  <td className={`right mono ${tone(p.pnl_sol)}`}>{signed(p.pnl_sol)}<div className="small">{pct(p.pnl_pct)}</div></td>
                  <td>
                    <div className="row wrap" style={{ gap: 4, maxWidth: 300 }}>
                      <ExitChips p={p} />
                      {user.limits.tp_sl && <button className="btn sm ghost" onClick={() => setEdit(p)}>Edit</button>}
                    </div>
                  </td>
                  <td className="right">
                    <div className="row" style={{ justifyContent: "flex-end" }}>
                      {[25, 50].map((x) => <button key={x} className="btn sm" disabled={busy === p.id} onClick={() => sell(p, x)}>{x}%</button>)}
                      <button className="btn sm danger" disabled={busy === p.id} onClick={() => sell(p, 100)}>{busy === p.id ? "..." : "Sell all"}</button>
                      {p.pnl_sol != null && <button className="btn sm ghost" title="Share" onClick={() => setShare({ symbol: p.symbol, pnlSol: p.pnl_sol, pnlPct: p.pnl_pct, paper: p.paper })}><Icon name="share" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="empty">{open.data ? "No open positions." : "Loading..."}</div>)}

        {tab === "history" && (history.data?.trades?.length ? (
          <table>
            <thead><tr><th>Time</th><th>Side</th><th>Token</th><th className="right">SOL</th><th className="right">Fee</th><th className="right">P&amp;L</th><th>Source</th><th className="right">Tx</th></tr></thead>
            <tbody>
              {history.data.trades.map((t) => (
                <tr key={t.id}>
                  <td className="mono mute small">{when(t.created_at)}</td>
                  <td><span className={`chip ${t.side === "buy" ? "acc" : "red"}`}>{t.side.toUpperCase()}</span></td>
                  <td><b>{t.symbol}</b></td>
                  <td className="right mono">{sol(t.sol)}</td>
                  <td className="right mono mute">{sol(t.fee_sol, 5)}</td>
                  <td className={`right mono ${tone(t.pnl_sol)}`}>{t.pnl_sol == null ? "-" : signed(t.pnl_sol)}</td>
                  <td><span className="chip">{t.reason && t.reason !== "manual" ? t.reason : t.source}</span></td>
                  <td className="right">
                    {t.signature ? <a className="chip" href={solscan(t.signature)} target="_blank" rel="noreferrer">View</a> : <span className="chip">paper</span>}
                    {t.pnl_sol != null && <button className="btn sm ghost" title="Share" style={{ marginLeft: 6 }} onClick={() => setShare({ symbol: t.symbol, pnlSol: t.pnl_sol, pnlPct: null, paper: t.paper })}><Icon name="share" /></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="empty">{history.data ? "No trades yet." : "Loading..."}</div>)}
      </div></div>

      {edit && <Targets p={edit} onClose={() => setEdit(null)} onSaved={open.reload} />}
      {share && <ShareCard {...share} username={user.username} onClose={() => setShare(null)} />}
    </>
  );
}
