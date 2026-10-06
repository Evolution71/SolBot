import { useState } from "react";
import { Link } from "react-router-dom";
import { api, price, sol, toDate, useAuth, usePoll, useToast, when } from "../lib.jsx";
import { ExitChips, TokenCell, Upgrade } from "../components/ui.jsx";

const STATUS = { active: "acc", filled: "blue", failed: "red", cancelled: "", expired: "" };

function every(minutes) {
  if (minutes >= 1440) return `${minutes / 1440}d`;
  if (minutes >= 60) return `${minutes / 60}h`;
  return `${minutes}m`;
}

export default function Orders() {
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState("active");
  const { data, reload } = usePoll("/api/orders", 8000);
  const orders = (data?.orders || []).filter((o) => (tab === "active" ? o.status === "active" : o.status !== "active"));
  const activeCount = (data?.orders || []).filter((o) => o.status === "active").length;

  const cancel = async (o) => {
    try { await api(`/api/orders/${o.id}`, { method: "DELETE" }); toast("Order cancelled"); reload(); }
    catch (e) { toast(e.message, "error"); }
  };

  return (
    <>
      <div className="page-head">
        <div><h1>Orders</h1><p>Limit orders wait for your price. DCA spreads a buy over time.</p></div>
        <div className="row">
          <span className="chip">{activeCount} / {data?.limit ?? 0} ACTIVE</span>
          <div className="tabs">
            <button className={tab === "active" ? "on" : ""} onClick={() => setTab("active")}>Active</button>
            <button className={tab === "done" ? "on" : ""} onClick={() => setTab("done")}>History</button>
          </div>
        </div>
      </div>
      {data && data.limit === 0 && <Upgrade text={user.trial_available ? `Limit orders and DCA are on Hunter and above. Try them free for ${user.trial_days} days.` : "Limit orders and DCA are available on Hunter and above."} />}

      <div className="panel"><div className="table-wrap">
        {orders.length ? (
          <table>
            <thead><tr><th>Token</th><th>Type</th><th className="right">Size</th><th className="right">Target</th><th className="right">Now</th><th>Progress</th><th>Exit rules</th><th>Wallet</th><th className="right">Status</th></tr></thead>
            <tbody>
              {orders.map((o) => {
                const gap = o.trigger_price_usd && o.price_usd ? (o.price_usd / o.trigger_price_usd - 1) * 100 : null;
                return (
                  <tr key={o.id}>
                    <td><TokenCell t={{ symbol: o.symbol, name: when(o.created_at), image: o.image }} /></td>
                    <td><span className="chip">{o.kind === "dca" ? `DCA / ${every(o.interval_minutes)}` : "LIMIT"}</span></td>
                    <td className="right mono">{sol(o.sol_per_order, 3)}{o.kind === "dca" ? ` x ${o.total_orders}` : ""}</td>
                    <td className="right mono">{o.trigger_price_usd ? `≤ ${price(o.trigger_price_usd)}` : "any"}</td>
                    <td className="right mono">{price(o.price_usd)}{gap != null && gap > 0 && <div className="small dim">{gap.toFixed(1)}% above</div>}</td>
                    <td className="mono small">
                      {o.filled_orders} / {o.total_orders} filled
                      {o.status === "active" && o.kind === "dca" && o.next_run_at && <div className="dim">next {toDate(o.next_run_at) <= new Date() ? "now" : when(o.next_run_at)}</div>}
                      {o.status === "active" && o.expires_at && <div className="dim">expires {when(o.expires_at)}</div>}
                      {o.last_error && <div className="down" style={{ whiteSpace: "normal", maxWidth: 220 }}>{o.last_error}</div>}
                    </td>
                    <td><div className="row wrap" style={{ gap: 4 }}><ExitChips p={o} /></div></td>
                    <td className="small">{o.wallet}</td>
                    <td className="right">
                      <span className={`chip ${STATUS[o.status]}`}>{o.status.toUpperCase()}</span>
                      {o.status === "active" && <button className="btn sm danger" style={{ marginLeft: 8 }} onClick={() => cancel(o)}>Cancel</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty">
            {!data ? "Loading..." : tab === "active"
              ? <>No active orders. Open any token in <Link className="up" to="/app/discover">Discover</Link> and choose the Limit or DCA tab.</>
              : "No past orders yet."}
          </div>
        )}
      </div></div>
    </>
  );
}
