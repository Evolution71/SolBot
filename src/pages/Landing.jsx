import { Link } from "react-router-dom";
import { age, pct, price, tone, usd, useAuth, usePoll } from "../lib.jsx";
import { Brand, Icon, TokenCell } from "../components/ui.jsx";

const FEATURES = [
  ["radar", "Live token discovery", "New Solana pools and trending tokens streamed into one feed with price, liquidity, volume and buy/sell pressure."],
  ["shield", "Rug-risk scoring", "Every token is checked on-chain for mint authority, freeze authority, holder concentration and liquidity depth before you buy."],
  ["target", "Auto-sniper", "Set your size and filters once. The engine buys new pools that pass your rules and skips the ones that don't."],
  ["layers", "Take-profit, stop-loss, trailing", "Exits are watched around the clock and executed automatically, so a position is never left unattended."],
  ["users", "Copy trading", "Follow any Solana wallet. When it buys or sells, your wallet mirrors the trade at the size you chose."],
  ["wallet", "Your wallet, your keys", "Each account gets a dedicated trading wallet. Export the private key or withdraw at any moment."],
];

const STEPS = [
  ["Create your account", "Sign up with an email. A dedicated Solana trading wallet is generated for you instantly."],
  ["Fund your wallet", "Send SOL to your deposit address from any wallet or exchange. No SOL yet? Buy it with a card through an on-ramp and send it over."],
  ["Trade or automate", "Buy manually from the live feed, or arm the auto-sniper and copy trading and let the engine work your rules."],
  ["Withdraw whenever you want", "Your balance stays in your own wallet on-chain. Withdraw to any address, or export the key and walk away."],
];

export default function Landing() {
  const { user } = useAuth();
  const { data: feed } = usePoll("/api/market/feed?kind=new", 10000);
  const { data: billing } = usePoll("/api/billing/plans");
  const cta = user ? "/app" : "/register";

  return (
    <div className="land">
      <div className="land-in">
        <nav className="land-nav">
          <Brand />
          <div className="links"><a href="#features">Features</a><a href="#how">How it works</a><a href="#plans">Plans</a><Link to="/app/leaderboard">Leaderboard</Link></div>
          <div className="row">
            {!user && <Link to="/login" className="btn ghost">Sign in</Link>}
            <Link to={cta} className="btn primary">{user ? "Open terminal" : "Start free"}</Link>
          </div>
        </nav>

        <header className="hero">
          <div>
            <span className="chip acc"><span className="dot" />SOLANA MAINNET</span>
            <h1 style={{ marginTop: 18 }}>Be in the pool<br />before the <em>crowd</em>.</h1>
            <p className="lead">
              Nexus Sol Bot is a trading terminal for new Solana tokens. It finds fresh pools, checks them for rug risk,
              and buys and sells by your rules, from a wallet only you control.
            </p>
            <div className="row wrap">
              <Link to={cta} className="btn primary lg">{user ? "Open terminal" : "Create free account"}</Link>
              <a href="#how" className="btn lg ghost">See how it works</a>
            </div>
            <div className="hero-facts">
              <div><b>4</b><span>on-chain safety checks per token</span></div>
              <div><b>24/7</b><span>exit monitoring</span></div>
              <div><b>0.25%</b><span>lowest trading fee</span></div>
            </div>
          </div>

          <div className="term">
            <div className="term-bar"><span className="eyebrow">New pools</span><span className="chip acc"><span className="dot" />LIVE</span></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Token</th><th className="right">Age</th><th className="right">Price</th><th className="right">1h</th><th className="right">Liquidity</th></tr></thead>
                <tbody>
                  {(feed?.tokens || []).slice(0, 7).map((t) => (
                    <tr key={t.mint}>
                      <td><TokenCell t={t} /></td>
                      <td className="right mono mute">{age(t.age_minutes)}</td>
                      <td className="right mono">{price(t.price_usd)}</td>
                      <td className={`right mono ${tone(t.change_h1)}`}>{pct(t.change_h1)}</td>
                      <td className="right mono">{usd(t.liquidity_usd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!feed?.tokens?.length && <div className="empty">Connecting to the live feed...</div>}
            </div>
          </div>
        </header>
      </div>

      <section className="section" id="features">
        <div className="land-in">
          <div className="eyebrow">What you get</div>
          <h2>Everything a sniper needs, in one terminal.</h2>
          <p className="sub">Discovery, safety checks, execution and exits. Built to be fast to read and hard to misuse.</p>
          <div className="grid g3" style={{ marginTop: 36 }}>
            {FEATURES.map(([icon, title, text]) => (
              <div className="feat" key={title}><div className="ico"><Icon name={icon} /></div><h4>{title}</h4><p>{text}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="how">
        <div className="land-in">
          <div className="eyebrow">How it works</div>
          <h2>From sign-up to first snipe in minutes.</h2>
          <div className="steps" style={{ marginTop: 30 }}>
            {STEPS.map(([title, text]) => <div className="step" key={title}><h4>{title}</h4><p>{text}</p></div>)}
          </div>
        </div>
      </section>

      <section className="section" id="plans">
        <div className="land-in">
          <div className="eyebrow">Plans</div>
          <h2>Start free. Upgrade when the tools pay for themselves.</h2>
          <p className="sub">Paid plans run for {billing?.days ?? 30} days and are paid in SOL. The payment is verified on-chain and your plan activates immediately.</p>
          <div className="plans" style={{ marginTop: 36 }}>
            {(billing?.plans || []).map((p) => (
              <div key={p.id} className={`plan ${p.id === "elite" ? "hot" : ""}`}>
                <div className="row between"><h3>{p.name}</h3>{p.id === "elite" && <span className="chip acc">POPULAR</span>}</div>
                <div className="price">${p.price_usd}<small>{p.price_usd ? " / 30 days" : " forever"}</small></div>
                <p className="mute small">{p.tagline}</p>
                <ul>{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
                <Link to={user ? "/app/plans" : "/register"} className={`btn block ${p.id === "elite" ? "primary" : ""}`}>{p.price_usd ? `Get ${p.name}` : "Start free"}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="land-in">
          <div className="risk">
            <b>Risk disclosure.</b> Trading newly launched tokens is highly speculative. Most new tokens lose most or all of their value,
            and automated tools, safety scores and copy trading cannot prevent losses. Nexus Sol Bot does not provide financial advice and does
            not promise profits. Only trade with money you can afford to lose.
          </div>
        </div>
      </section>

      <footer className="foot">
        <div className="land-in row between wrap">
          <Brand />
          <span>© {new Date().getFullYear()} Nexus Sol Bot. Not available where prohibited by law.</span>
        </div>
      </footer>
    </div>
  );
}
