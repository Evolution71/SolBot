import { Link, useOutletContext } from "react-router-dom";
import { clock, pct, signed, sol, tone, usd, useAuth, usePoll } from "../lib.jsx";
import { TokenCell } from "../components/ui.jsx";

export function PnlBars({ daily }) {
  const max = Math.max(...daily.map((d) => Math.abs(d.pnl)), 1e-9);
  return (
    <div className="bars" role="img" aria-label="Realized profit and loss per day for the last 14 days">
      {daily.map((d) => {
        const h = `${Math.max(3, (Math.abs(d.pnl) / max) * 100)}%`;
        const cls = d.pnl > 0 ? "" : d.pnl < 0 ? "neg" : "zero";
        return (
          <div key={d.day} className={cls} title={`${d.day}: ${signed(d.pnl)} SOL`}>
            <div className="hi">{d.pnl > 0 && <span style={{ height: h }} />}</div>
            <div className="lo">{d.pnl <= 0 && <span style={{ height: d.pnl < 0 ? h : 2 }} />}</div>
          </div>
        );
      })}
    </div>
  );
}

export function Activity({ events }) {
  if (!events?.length) return <div className="empty">No engine activity yet. Arm the auto-sniper or add a wallet to copy.</div>;
  return (
    <div className="feed">
      {events.map((e, i) => (
        <div key={i} className={`feed-item ${e.kind}`}><time>{clock(e.ts)}</time><span><b>{e.kind.toUpperCase()}</b> {e.text}</span></div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { wallet } = useOutletContext();
  const { data: stats } = usePoll("/api/trade/stats", 10000);
  const { data: pos } = usePoll("/api/trade/positions", 8000);
  const { data: act } = usePoll("/api/sniper/activity", 6000);
  const total = stats ? stats.realized_pnl_sol + stats.unrealized_pnl_sol : null;

  return (
    <>
      <div className="page-head">
        <div><h1>Dashboard</h1><p>Welcome back, {user.username}.</p></div>
        <Link to="/app/discover" className="btn primary">Find tokens</Link>
      </div>

      <div className="grid g4">
        <div className="panel stat"><small>Wallet balance</small><b>{wallet ? sol(wallet.sol, 3) : "-"} SOL</b>
          <small>{wallet?.sol_usd ? usd(wallet.sol * wallet.sol_usd) : " "}</small></div>
        <div className="panel stat"><small>Total P&amp;L</small><b className={tone(total)}>{signed(total, 3)} SOL</b>
          <small>realized {signed(stats?.realized_pnl_sol, 3)}</small></div>
        <div className="panel stat"><small>Open positions</small><b>{stats?.open_positions ?? "-"}</b>
          <small>worth {sol(stats?.open_value_sol, 3)} SOL</small></div>
        <div className="panel stat"><small>Win rate</small><b>{stats?.win_rate == null ? "-" : `${stats.win_rate}%`}</b>
          <small>{stats?.closed_trades ?? 0} closed trades</small></div>
      </div>

      <div className="grid split" style={{ marginTop: 14 }}>
        <div className="panel">
          <div className="panel-head"><h3>Realized P&amp;L, last 14 days</h3><span className="chip">SOL</span></div>
          <div className="panel-body">{stats ? <PnlBars daily={stats.daily} /> : <div className="empty">Loading...</div>}</div>
        </div>
        <div className="panel">
          <div className="panel-head"><h3>Engine activity</h3><Link to="/app/sniper" className="btn sm">Configure</Link></div>
          <Activity events={act?.events?.slice(0, 8)} />
        </div>
      </div>

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="panel-head"><h3>Open positions</h3><Link to="/app/positions" className="btn sm">Manage</Link></div>
        <div className="table-wrap">
          {pos?.positions?.length ? (
            <table>
              <thead><tr><th>Token</th><th className="right">Cost</th><th className="right">Value</th><th className="right">P&amp;L</th><th className="right">Source</th></tr></thead>
              <tbody>
                {pos.positions.slice(0, 6).map((p) => (
                  <tr key={p.id}>
                    <td><TokenCell t={p} /></td>
                    <td className="right mono">{sol(p.cost_sol)}</td>
                    <td className="right mono">{sol(p.value_sol)}</td>
                    <td className={`right mono ${tone(p.pnl_sol)}`}>{signed(p.pnl_sol)} <span className="small">({pct(p.pnl_pct)})</span></td>
                    <td className="right"><span className="chip">{p.source}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div className="empty">No open positions. Head to Discover to place your first trade.</div>}
        </div>
      </div>
    </>
  );
}
