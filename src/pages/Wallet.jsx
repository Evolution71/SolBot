import { useState } from "react";
import { api, sol, usd, useAuth, usePoll, useToast } from "../lib.jsx";
import { CopyBox, Field, Num, solscan } from "../components/ui.jsx";

export default function Wallet() {
  const { user } = useAuth();
  const toast = useToast();
  const { data: w, reload } = usePoll("/api/wallet", 10000);
  const [out, setOut] = useState({ address: "", sol: null, password: "" });
  const [pw, setPw] = useState("");
  const [secret, setSecret] = useState(null);
  const [busy, setBusy] = useState("");
  const [lastSig, setLastSig] = useState(null);

  const run = (name, fn) => async (e) => {
    e?.preventDefault();
    setBusy(name);
    try { await fn(); } catch (err) { toast(err.message, "error"); } finally { setBusy(""); }
  };
  const withdraw = run("withdraw", async () => {
    const r = await api("/api/wallet/withdraw", { method: "POST", body: { ...out, address: out.address.trim() } });
    setLastSig(r.signature);
    toast("Withdrawal confirmed");
    setOut({ address: "", sol: null, password: "" });
    reload();
  });
  const reveal = run("export", async () => {
    setSecret((await api("/api/wallet/export", { method: "POST", body: { password: pw } })).secret_key);
    setPw("");
  });
  const reset = run("reset", async () => { await api("/api/wallet/paper-reset", { method: "POST" }); toast("Paper balance reset"); reload(); });

  if (!w) return <div className="empty">Loading wallet...</div>;
  return (
    <>
      <div className="page-head"><div><h1>Wallet</h1><p>Your dedicated trading wallet. Only you can withdraw from it or export its key.</p></div></div>

      <div className="grid g2">
        <div className="panel">
          <div className="panel-head"><h3>{w.paper_trading ? "Paper balance" : "Balance"}</h3>{!w.rpc_ok && <span className="chip amber">RPC UNREACHABLE</span>}</div>
          <div className="panel-body stack">
            <div><span className="mono" style={{ fontSize: 34, fontWeight: 700 }}>{sol(w.sol)}</span> <span className="mute">SOL</span>
              <div className="mute">{w.sol_usd ? usd(w.sol * w.sol_usd) : ""}</div></div>
            {w.paper_trading && (
              <>
                <p className="small mute">On-chain balance of this wallet: <span className="mono">{w.chain_sol == null ? "unknown" : `${sol(w.chain_sol)} SOL`}</span></p>
                <button className="btn" disabled={busy === "reset"} onClick={reset}>Reset paper balance</button>
              </>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><h3>Deposit SOL</h3><span className="chip acc">SOLANA NETWORK</span></div>
          <div className="panel-body stack">
            <CopyBox value={w.address} label="Deposit address copied" />
            <p className="small mute">Send SOL to this address from Phantom, Solflare, or an exchange such as Binance or Bybit. Deposits show up within seconds. Keep at least 0.01 SOL for network fees.</p>
            <p className="small mute">No crypto yet? Buy SOL with a card at <a className="up" href="https://www.moonpay.com/buy/sol" target="_blank" rel="noreferrer">MoonPay</a> or <a className="up" href="https://global.transak.com" target="_blank" rel="noreferrer">Transak</a> and enter the address above as the destination.</p>
          </div>
        </div>

        <form className="panel" onSubmit={withdraw}>
          <div className="panel-head"><h3>Withdraw</h3></div>
          <div className="panel-body stack">
            <Field label="Destination address"><input className="input mono" required value={out.address} onChange={(e) => setOut({ ...out, address: e.target.value })} /></Field>
            <div className="grid g2">
              <Field label="Amount (SOL)"><Num value={out.sol} onChange={(v) => setOut({ ...out, sol: v })} min="0.000001" step="0.01" required /></Field>
              <Field label="Account password"><input className="input" type="password" required value={out.password} onChange={(e) => setOut({ ...out, password: e.target.value })} /></Field>
            </div>
            <button className="btn primary block" disabled={busy === "withdraw"}>{busy === "withdraw" ? "Sending..." : "Withdraw"}</button>
            {w.paper_trading && <p className="small dim">Withdrawals move real SOL from the on-chain wallet, not the paper balance.</p>}
            {lastSig && <a className="chip acc" href={solscan(lastSig)} target="_blank" rel="noreferrer">View last withdrawal on Solscan</a>}
          </div>
        </form>

        <div className="panel">
          <div className="panel-head"><h3>Export private key</h3></div>
          <div className="panel-body stack">
            <p className="small mute">Import this key into Phantom or Solflare to control the wallet outside Nexus. Anyone who sees it can take your funds: never share it, and nobody from Nexus will ever ask for it.</p>
            {secret ? (
              <>
                <div className="secret">{secret}</div>
                <button className="btn" onClick={() => setSecret(null)}>Hide key</button>
              </>
            ) : (
              <form className="row" onSubmit={reveal}>
                <input className="input" type="password" required placeholder={`Password for ${user.email}`} value={pw} onChange={(e) => setPw(e.target.value)} />
                <button className="btn danger" disabled={busy === "export"}>Reveal</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
