import { useState } from "react";
import { Navigate } from "react-router-dom";
import { api, short, sol, useAuth, usePoll, useToast, when } from "../lib.jsx";
import { CopyBox, solscan } from "../components/ui.jsx";

const PLAN_IDS = ["free", "pro", "elite", "whale"];

export default function Admin() {
  const { user } = useAuth();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("users");
  const { data: o } = usePoll("/api/admin/overview", 20000, user.is_admin);
  const users = usePoll(`/api/admin/users?q=${encodeURIComponent(q)}`, 0, user.is_admin);
  const pays = usePoll("/api/admin/payments", 0, user.is_admin && tab === "payments");
  if (!user.is_admin) return <Navigate to="/app" replace />;

  const act = async (path, body, msg) => {
    try { await api(path, { method: "POST", body }); toast(msg); users.reload(); }
    catch (e) { toast(e.message, "error"); }
  };

  return (
    <>
      <div className="page-head"><div><h1>Admin</h1><p>Revenue, users and payments.</p></div>
        {o?.paper_trading && <span className="chip amber">PAPER MODE - TRADING FEES ARE SIMULATED</span>}</div>

      {o && (
        <>
          <div className="grid g4">
            <div className="panel stat"><small>Users</small><b>{o.users}</b><small>+{o.users_7d} this week</small></div>
            <div className="panel stat"><small>Plan revenue</small><b className="up">{sol(o.plan_revenue_sol, 3)} SOL</b><small>${o.plan_revenue_usd} from {o.payments} payments</small></div>
            <div className="panel stat"><small>Trading fees collected</small><b className="up">{sol(o.fee_revenue_sol, 4)} SOL</b><small>{o.live_trades} live trades</small></div>
            <div className="panel stat"><small>Paying users</small><b>{o.by_plan.pro + o.by_plan.elite + o.by_plan.whale}</b>
              <small>{o.by_plan.pro} Hunter · {o.by_plan.elite} Apex · {o.by_plan.whale} Leviathan</small></div>
          </div>
          <div className="panel" style={{ marginTop: 14 }}>
            <div className="panel-head"><h3>Treasury wallet</h3><a className="chip" href={`https://solscan.io/account/${o.treasury}`} target="_blank" rel="noreferrer">Open on Solscan</a></div>
            <div className="panel-body"><CopyBox value={o.treasury} /></div>
          </div>
        </>
      )}

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="panel-head">
          <div className="tabs">
            <button className={tab === "users" ? "on" : ""} onClick={() => setTab("users")}>Users</button>
            <button className={tab === "payments" ? "on" : ""} onClick={() => setTab("payments")}>Payments</button>
          </div>
          {tab === "users" && <input className="input" style={{ maxWidth: 260 }} placeholder="Search email or username" value={q} onChange={(e) => setQ(e.target.value)} />}
        </div>
        <div className="table-wrap">
          {tab === "users" && (
            <table>
              <thead><tr><th>User</th><th>Wallet</th><th>Joined</th><th>Plan</th><th className="right">Access</th></tr></thead>
              <tbody>{(users.data?.users || []).map((u) => (
                <tr key={u.id}>
                  <td><b>{u.username}</b>{u.is_admin && <span className="chip acc" style={{ marginLeft: 6 }}>ADMIN</span>}<div className="small dim">{u.email}</div></td>
                  <td className="mono small"><a href={`https://solscan.io/account/${u.wallet}`} target="_blank" rel="noreferrer">{short(u.wallet, 5)}</a></td>
                  <td className="mono small mute">{when(u.created_at)}</td>
                  <td>
                    <select className="input" style={{ height: 32, width: 120 }} value={u.plan}
                      onChange={(e) => act(`/api/admin/users/${u.id}/plan`, { plan: e.target.value, days: 30 }, `${u.username} set to ${e.target.value} for 30 days`)}>
                      {PLAN_IDS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </td>
                  <td className="right">
                    <button className={`btn sm ${u.is_active ? "danger" : ""}`} disabled={u.id === user.id}
                      onClick={() => act(`/api/admin/users/${u.id}/active`, { is_active: !u.is_active }, u.is_active ? "User suspended" : "User restored")}>
                      {u.is_active ? "Suspend" : "Restore"}
                    </button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          )}
          {tab === "payments" && (pays.data?.payments?.length ? (
            <table>
              <thead><tr><th>Date</th><th>User</th><th>Plan</th><th className="right">USD</th><th className="right">SOL</th><th>Status</th><th className="right">Tx</th></tr></thead>
              <tbody>{pays.data.payments.map((p) => (
                <tr key={p.id}>
                  <td className="mono small mute">{when(p.created_at)}</td><td><b>{p.username}</b></td><td>{p.plan}</td>
                  <td className="right mono">${p.usd}</td><td className="right mono">{sol(p.sol, 6)}</td>
                  <td><span className={`chip ${p.status === "confirmed" ? "acc" : ""}`}>{p.status.toUpperCase()}</span></td>
                  <td className="right">{p.signature ? <a className="chip" href={solscan(p.signature)} target="_blank" rel="noreferrer">View</a> : "-"}</td>
                </tr>
              ))}</tbody>
            </table>
          ) : <div className="empty">No payments yet.</div>)}
        </div>
      </div>
    </>
  );
}
