import { sol, usePoll, when } from "../lib.jsx";
import { CopyBox } from "../components/ui.jsx";

export default function Referrals() {
  const { data: r } = usePoll("/api/referral", 30000);
  if (!r) return <div className="empty">Loading...</div>;
  const done = Math.min(r.active, r.unlock_at);
  const tweet = `I trade new Solana tokens on Nexus Sol Bot. Join with my link: ${r.link}`;

  return (
    <>
      <div className="page-head"><div><h1>Referrals</h1><p>Earn {r.share_pct}% of the trading fees your friends pay, sent to your wallet on every trade.</p></div></div>

      <div className="grid g3">
        <div className="panel stat"><small>Signed up</small><b>{r.signed_up}</b><small>friends used your link</small></div>
        <div className="panel stat"><small>Active traders</small><b>{r.active}</b><small>made at least one trade</small></div>
        <div className="panel stat"><small>Earned</small><b className="up">{sol(r.earned_sol, 5)} SOL</b><small>paid straight to your trading wallet</small></div>
      </div>

      <div className="grid g2" style={{ marginTop: 14 }}>
        <div className="panel">
          <div className="panel-head"><h3>Your invite link</h3><span className="chip mono">{r.code}</span></div>
          <div className="panel-body stack">
            <CopyBox value={r.link} label="Invite link copied" />
            <div className="row wrap">
              <a className="btn sm" target="_blank" rel="noreferrer" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`}>Share on X</a>
              <a className="btn sm" target="_blank" rel="noreferrer" href={`https://t.me/share/url?url=${encodeURIComponent(r.link)}&text=${encodeURIComponent("Trade new Solana tokens with me on Nexus Sol Bot")}`}>Share on Telegram</a>
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><h3>Free Hunter month</h3>{r.reward_granted && <span className="chip acc">UNLOCKED</span>}</div>
          <div className="panel-body stack">
            <p className="mute">Invite {r.unlock_at} friends who each make a trade and get 30 days of the Hunter plan free.</p>
            <div className="progress"><i style={{ width: `${(done / r.unlock_at) * 100}%` }} /></div>
            <div className="row between small mono mute"><span>{done} / {r.unlock_at} active friends</span><span>{r.reward_granted ? "Reward granted" : `${r.unlock_at - done} to go`}</span></div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="panel-head"><h3>Your referrals</h3></div>
        <div className="table-wrap">
          {r.referees.length ? (
            <table>
              <thead><tr><th>User</th><th>Joined</th><th className="right">Status</th></tr></thead>
              <tbody>{r.referees.map((f) => (
                <tr key={f.username}><td><b>{f.username}</b></td><td className="mono small mute">{when(f.joined)}</td>
                  <td className="right"><span className={`chip ${f.active ? "acc" : ""}`}>{f.active ? "TRADING" : "SIGNED UP"}</span></td></tr>
              ))}</tbody>
            </table>
          ) : <div className="empty">Nobody has joined with your link yet.</div>}
        </div>
      </div>
    </>
  );
}
