import { signed, tone, useAuth, usePoll } from "../lib.jsx";

export default function Leaderboard() {
  const { user } = useAuth();
  const { data } = usePoll("/api/leaderboard", 30000);
  return (
    <>
      <div className="page-head">
        <div><h1>Leaderboard</h1><p>Top realized profit over the last 7 days.</p></div>
        {data?.paper && <span className="chip amber">PAPER TRADES</span>}
      </div>
      <div className="panel"><div className="table-wrap">
        {data?.rows?.length ? (
          <table>
            <thead><tr><th style={{ width: 70 }}>Rank</th><th>Trader</th><th className="right">Closed trades</th><th className="right">Realized P&amp;L</th></tr></thead>
            <tbody>{data.rows.map((r) => (
              <tr key={r.rank} style={r.username === user?.username ? { background: "var(--acc-soft)" } : null}>
                <td className="mono"><b className={r.rank <= 3 ? "up" : ""}>#{r.rank}</b></td>
                <td><b>{r.username}</b>{r.username === user?.username && <span className="chip acc" style={{ marginLeft: 8 }}>YOU</span>}</td>
                <td className="right mono">{r.trades}</td>
                <td className={`right mono ${tone(r.pnl_sol)}`}>{signed(r.pnl_sol)} SOL</td>
              </tr>
            ))}</tbody>
          </table>
        ) : <div className="empty">{data ? "No closed trades this week yet. Be the first on the board." : "Loading..."}</div>}
      </div></div>
    </>
  );
}
