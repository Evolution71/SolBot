import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { sol, toDate, useAuth, usePoll } from "../lib.jsx";
import { Brand, Icon } from "./ui.jsx";

const NAV = [
  ["Trade", [["/app", "Dashboard", "grid"], ["/app/discover", "Discover", "radar"], ["/app/sniper", "Auto-Sniper", "target"],
             ["/app/positions", "Positions", "layers"], ["/app/copy", "Copy Trade", "users"]]],
  ["Account", [["/app/wallet", "Wallet", "wallet"], ["/app/plans", "Plans", "bolt"], ["/app/referrals", "Referrals", "gift"],
               ["/app/leaderboard", "Leaderboard", "trophy"]]],
];

export default function Layout() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { data: wallet } = usePoll("/api/wallet", 15000);
  const promo = user.fee_free_until && toDate(user.fee_free_until) > new Date();

  return (
    <div className="shell">
      <aside className={`side ${open ? "open" : ""}`} onClick={() => setOpen(false)}>
        <Brand to="/app" />
        {NAV.map(([label, links]) => (
          <div key={label}>
            <div className="eyebrow nav-label">{label}</div>
            <nav className="nav">
              {links.map(([to, text, icon]) => (
                <NavLink key={to} to={to} end={to === "/app"}><Icon name={icon} />{text}</NavLink>
              ))}
              {label === "Account" && user.is_admin && <NavLink to="/app/admin"><Icon name="shield" />Admin</NavLink>}
            </nav>
          </div>
        ))}
        <div className="side-foot">
          <div className="row between">
            <div style={{ minWidth: 0 }}>
              <b style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis" }}>{user.username}</b>
              <span className="chip acc" style={{ marginTop: 4 }}>{user.plan_name}</span>
            </div>
            <button className="btn sm ghost" title="Sign out" onClick={() => { signOut(); navigate("/"); }}><Icon name="out" /></button>
          </div>
        </div>
      </aside>

      <div className="main">
        {user.paper_trading && (
          <div className="banner"><b>PAPER MODE</b><span>Trades are simulated against live prices. No real funds move.</span></div>
        )}
        <header className="topbar">
          <div className="row">
            <button className="btn sm menu-btn" onClick={() => setOpen(!open)} aria-label="Menu"><Icon name="menu" /></button>
            <span className="chip"><span className="dot" />{pathname === "/app/discover" ? "LIVE FEED" : "ENGINE ONLINE"}</span>
            {promo && <span className="chip acc hide-sm">0% FEES UNTIL {toDate(user.fee_free_until).toLocaleDateString()}</span>}
          </div>
          <div className="row">
            <span className="chip hide-sm">FEE {(user.fee_bps / 100).toFixed(2)}%</span>
            <NavLink to="/app/wallet" className="btn sm">
              <Icon name="wallet" /><span className="mono">{wallet ? sol(wallet.sol, 3) : "-.---"} SOL</span>
            </NavLink>
          </div>
        </header>
        <main className="content"><Outlet context={{ wallet }} /></main>
      </div>
    </div>
  );
}
