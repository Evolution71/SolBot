import { Link } from "react-router-dom";
import { age, pct, price, sol, tone, usd, useAuth, usePoll } from "../lib.jsx";
import { Brand, Icon, TokenCell } from "../components/ui.jsx";

const FEATURES = [
  ["radar", "Token scanner", "New Solana pools and trending tokens in one live feed, with price, liquidity, volume and buy/sell pressure."],
  ["target", "Snipe on launch", "Set your size and filters once. The engine buys new pools that pass your rules and skips the ones that don't."],
  ["users", "Copy trading", "Follow any Solana wallet. When it buys or sells, your wallet mirrors the trade at the size you chose."],
  ["orders", "Limit orders & DCA", "Wait for your price with a limit order or a ladder of them, or average in automatically over time."],
  ["layers", "Multi-level exits", "Take profit in up to five steps, with a stop-loss and trailing stop watching the rest of the position."],
  ["shield", "Rug-risk protection", "On-chain checks before you buy, plus a liquidity guard that exits if the pool is drained after you buy."],
  ["wallet", "Multi-wallet", "Run separate wallets for separate strategies, each with its own balance, address and private key."],
  ["grid", "P&L dashboard", "Realized and open profit across every wallet, win rate, fees paid, and a shareable card for each trade."],
  ["key", "Your keys, exportable", "Export any wallet's private key or withdraw to any address whenever you want. Nothing is locked in."],
];

const STEPS = [
  ["Create your account", "Sign up with an email. A dedicated Solana trading wallet is generated for you instantly."],
  ["Fund your wallet", "Send SOL to your deposit address from any wallet or exchange. No SOL yet? Buy it with a card through an on-ramp and send it over."],
  ["Configure your strategy", "Choose your slippage, take-profit levels, stop-loss and safety filters, or simply trade by hand from the live feed."],
  ["Trade, then withdraw whenever you want", "The engine works your rules around the clock. Your balance stays in your own wallet on-chain, ready to withdraw."],
];

const SECURITY = [
  ["wallet", "A wallet of your own", "Every account gets dedicated wallets. Your SOL is never pooled with other users' funds."],
  ["lock", "Keys encrypted at rest", "Private keys are stored encrypted and are only decrypted in memory at the moment a trade is signed."],
  ["key", "Leave any time", "Export your private key into Phantom or Solflare, or withdraw everything. Both need only your password."],
  ["route", "Verified on-chain", "Every plan payment and trade is a real Solana transaction you can open on Solscan."],
];

const COMPARE = [
  ["Trading fee", (p) => `${(p.fee_bps / 100).toFixed(2)}%`],
  ["Buys per day", (p) => p.daily_buys ?? "Unlimited"],
  ["Open positions", (p) => p.max_positions],
  ["Wallets", (p) => p.wallets],
  ["Auto-sniper", (p) => p.auto_snipe],
  ["Limit orders & DCA", (p) => (p.orders ? `${p.orders} active` : false)],
  ["Take-profit levels, stop-loss, liquidity guard", (p) => p.tp_sl],
  ["Trailing stop", (p) => p.trailing],
  ["Custom priority fees", (p) => p.priority_fees],
  ["Copy trading", (p) => (p.copy_wallets ? `${p.copy_wallets} wallets` : false)],
];

const FAQ = [
  ["Who holds my funds?", "Each account has its own Solana wallets, generated when you sign up. The private keys are stored encrypted on our servers so the engine can sign trades for you while you are away, which is what makes automation possible. You can export any key or withdraw your full balance at any time."],
  ["How do I deposit, and can I pay by card?", "Send SOL on the Solana network to the deposit address shown on your Wallets page. Cards are not accepted directly. If you have no crypto yet, buy SOL with a card on an on-ramp such as MoonPay or Transak and send it to your deposit address."],
  ["What does it cost?", "The Scout plan is free with a 1% fee per trade. Paid plans lower the fee to as little as 0.25% and unlock automation. Plans run for 30 days, are paid in SOL and do not renew automatically. Solana network fees apply to every transaction."],
  ["How does the free trial work?", "Every account can try the Hunter plan once for 3 days. No payment is taken and nothing renews. When the trial ends your account returns to Scout and any active automation is paused."],
  ["How fast is it?", "The scanner refreshes every few seconds and an order is sent the moment your rules match, routed through the Jupiter aggregator. We do not advertise a millisecond figure, because real speed depends on network conditions at that moment."],
  ["What is the liquidity guard?", "It watches the pool of every token you hold and sells your whole position if liquidity falls by the percentage you set. It reacts within seconds, so it helps with slow drains, but it cannot beat a pull that happens inside a single block."],
  ["Can I lose money?", "Yes. Most newly launched tokens lose most or all of their value. Safety scores, stop-losses and copy trading reduce risk but cannot remove it, and nothing here is financial advice. Only trade what you can afford to lose."],
];

function cell(value) {
  if (value === true) return <td className="yes">Yes</td>;
  if (value === false) return <td className="no">-</td>;
  return <td className="mono">{value}</td>;
}

export default function Landing() {
  const { user } = useAuth();
  const { data: feed } = usePoll("/api/market/feed?kind=new", 10000);
  const { data: billing } = usePoll("/api/billing/plans");
  const { data: stats } = usePoll("/api/stats");
  const cta = user ? "/app" : "/register";
  const plans = billing?.plans || [];
  const showStats = stats && !stats.paper_trading && stats.trades > 0;

  return (
    <div className="land">
      <div className="land-in">
        <nav className="land-nav">
          <Brand />
          <div className="links"><a href="#features">Features</a><a href="#how">How it works</a><a href="#security">Security</a><a href="#plans">Plans</a><a href="#faq">FAQ</a></div>
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
              and buys and sells by your rules, from wallets you can withdraw from at any time.
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

        <div style={{ paddingBottom: 30 }}>
          <div className="eyebrow">Liquidity from across Solana</div>
          <div className="protocols">{["Jupiter", "Raydium", "Orca", "Meteora", "Pump.fun"].map((n) => <span key={n}>{n}</span>)}</div>
          <p className="small dim" style={{ marginTop: 12, maxWidth: 620 }}>Trades are routed through the Jupiter aggregator, which draws on these venues for the best available price. Nexus Sol Bot is independent and is not affiliated with or endorsed by them.</p>
        </div>
      </div>

      <section className="section" id="features">
        <div className="land-in">
          <div className="eyebrow">Trading arsenal</div>
          <h2>Everything a sniper needs, in one terminal.</h2>
          <p className="sub">Discovery, safety checks, entries, exits and wallets. Built to be fast to read and hard to misuse.</p>
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

      <section className="section" id="security">
        <div className="land-in">
          <div className="eyebrow">Security</div>
          <h2>Clear about where your funds are.</h2>
          <p className="sub">Automation needs a wallet the engine can sign with. Here is exactly how that wallet is handled.</p>
          <div className="grid g4" style={{ marginTop: 36 }}>
            {SECURITY.map(([icon, title, text]) => (
              <div className="feat" key={title}><div className="ico"><Icon name={icon} /></div><h4>{title}</h4><p>{text}</p></div>
            ))}
          </div>
        </div>
      </section>

      {showStats && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="land-in">
            <div className="grid g3">
              <div className="panel stat"><small>Traders</small><b>{stats.users.toLocaleString()}</b><small>registered accounts</small></div>
              <div className="panel stat"><small>Trades executed</small><b>{stats.trades.toLocaleString()}</b><small>on Solana mainnet</small></div>
              <div className="panel stat"><small>Volume</small><b>{sol(stats.volume_sol, 1)} SOL</b><small>{billing?.sol_usd ? usd(stats.volume_sol * billing.sol_usd) : "all time"}</small></div>
            </div>
          </div>
        </section>
      )}

      <section className="section" id="plans">
        <div className="land-in">
          <div className="eyebrow">Plans</div>
          <h2>Start free. Upgrade when the tools pay for themselves.</h2>
          <p className="sub">
            Paid plans run for {billing?.days ?? 30} days and are paid in SOL, verified on-chain.
            {billing?.trial && ` Every account can try ${billing.trial.plan_name} free for ${billing.trial.days} days, no payment required.`}
          </p>
          <div className="plans" style={{ marginTop: 36 }}>
            {plans.map((p) => (
              <div key={p.id} className={`plan ${p.id === "elite" ? "hot" : ""}`}>
                <div className="row between"><h3>{p.name}</h3>{p.id === "elite" && <span className="chip acc">POPULAR</span>}</div>
                <div className="price">${p.price_usd}<small>{p.price_usd ? " / 30 days" : " forever"}</small></div>
                <p className="mute small">{p.tagline}</p>
                <ul>{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
                <Link to={user ? "/app/plans" : "/register"} className={`btn block ${p.id === "elite" ? "primary" : ""}`}>
                  {!p.price_usd ? "Start free" : p.id === billing?.trial?.plan ? `Start ${billing.trial.days}-day free trial` : `Get ${p.name}`}
                </Link>
              </div>
            ))}
          </div>

          {plans.length > 0 && (
            <div className="panel" style={{ marginTop: 14 }}>
              <div className="panel-head"><h3>Compare plans</h3></div>
              <div className="table-wrap">
                <table className="compare">
                  <thead><tr><th>Feature</th>{plans.map((p) => <th key={p.id}>{p.name}</th>)}</tr></thead>
                  <tbody>
                    {COMPARE.map(([label, get]) => (
                      <tr key={label}><td>{label}</td>{plans.map((p) => <CellFor key={p.id} value={get(p)} />)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section" id="faq" style={{ paddingTop: 0 }}>
        <div className="land-in">
          <div className="eyebrow">FAQ</div>
          <h2>Straight answers.</h2>
          <div className="faq" style={{ marginTop: 26 }}>
            {FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="land-in stack" style={{ gap: 22 }}>
          <div className="cta">
            <h2>Ready to trade new pools with rules, not reflexes?</h2>
            <p>Create an account in under a minute. Start on the free plan and upgrade only if the tools earn it.</p>
            <Link to={cta} className="btn primary lg">{user ? "Open terminal" : "Create free account"}</Link>
          </div>
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

function CellFor({ value }) {
  return cell(value);
}
