import { useState } from "react";
import { api, sol, usd, useAuth, usePoll, useToast } from "../lib.jsx";
import { CopyBox, Field, Icon, Modal, Num, solscan } from "../components/ui.jsx";

function WalletActions({ wallet, paper, onClose, onChanged }) {
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState("deposit");
  const [out, setOut] = useState({ address: "", sol: null, password: "" });
  const [pw, setPw] = useState("");
  const [secret, setSecret] = useState(null);
  const [label, setLabel] = useState(wallet.label);
  const [busy, setBusy] = useState("");
  const [lastSig, setLastSig] = useState(null);

  const run = (name, fn) => async (e) => {
    e?.preventDefault();
    setBusy(name);
    try { await fn(); } catch (err) { toast(err.message, "error"); } finally { setBusy(""); }
  };
  const withdraw = run("withdraw", async () => {
    const r = await api(`/api/wallet/${wallet.id}/withdraw`, { method: "POST", body: { ...out, address: out.address.trim() } });
    setLastSig(r.signature);
    toast("Withdrawal confirmed");
    setOut({ address: "", sol: null, password: "" });
    onChanged();
  });
  const reveal = run("export", async () => {
    setSecret((await api(`/api/wallet/${wallet.id}/export`, { method: "POST", body: { password: pw } })).secret_key);
    setPw("");
  });
  const rename = run("rename", async () => {
    await api(`/api/wallet/${wallet.id}`, { method: "PATCH", body: { label } });
    toast("Wallet renamed");
    onChanged();
  });

  return (
    <Modal onClose={onClose}>
      <div className="panel-head"><h3>{wallet.label}</h3><button className="btn sm ghost" onClick={onClose}>Close</button></div>
      <div className="panel-body stack">
        <div className="tabs block">
          {[["deposit", "Deposit"], ["withdraw", "Withdraw"], ["key", "Private key"], ["rename", "Rename"]].map(([id, text]) => (
            <button key={id} className={tab === id ? "on" : ""} onClick={() => setTab(id)}>{text}</button>
          ))}
        </div>

        {tab === "deposit" && (
          <>
            <CopyBox value={wallet.address} label="Deposit address copied" />
            <p className="small mute">Send SOL to this address from Phantom, Solflare, or an exchange such as Binance or Bybit, on the Solana network. Deposits show up within seconds. Keep at least 0.01 SOL for network fees.</p>
            <p className="small mute">No crypto yet? Buy SOL with a card at <a className="up" href="https://www.moonpay.com/buy/sol" target="_blank" rel="noreferrer">MoonPay</a> or <a className="up" href="https://global.transak.com" target="_blank" rel="noreferrer">Transak</a> and enter the address above as the destination.</p>
          </>
        )}

        {tab === "withdraw" && (
          <form className="stack" onSubmit={withdraw}>
            <Field label="Destination address"><input className="input mono" required value={out.address} onChange={(e) => setOut({ ...out, address: e.target.value })} /></Field>
            <div className="grid g2">
              <Field label="Amount (SOL)"><Num value={out.sol} onChange={(v) => setOut({ ...out, sol: v })} min="0.000001" step="0.01" required /></Field>
              <Field label="Account password"><input className="input" type="password" required value={out.password} onChange={(e) => setOut({ ...out, password: e.target.value })} /></Field>
            </div>
            <button className="btn primary block" disabled={busy === "withdraw"}>{busy === "withdraw" ? "Sending..." : "Withdraw"}</button>
            {paper && <p className="small dim">Withdrawals move real SOL from the on-chain wallet ({wallet.chain_sol == null ? "balance unknown" : `${sol(wallet.chain_sol)} SOL`}), not the paper balance.</p>}
            {lastSig && <a className="chip acc" href={solscan(lastSig)} target="_blank" rel="noreferrer">View withdrawal on Solscan</a>}
          </form>
        )}

        {tab === "key" && (
          <>
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
          </>
        )}

        {tab === "rename" && (
          <form className="row" onSubmit={rename}>
            <input className="input" required maxLength={32} value={label} onChange={(e) => setLabel(e.target.value)} />
            <button className="btn primary" disabled={busy === "rename"}>Save</button>
          </form>
        )}
      </div>
    </Modal>
  );
}

export default function Wallet() {
  const toast = useToast();
  const { data: w, reload } = usePoll("/api/wallet", 10000);
  const [open, setOpen] = useState(null);
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState("");

  const act = (name, fn) => async (e) => {
    e?.preventDefault();
    setBusy(name);
    try { await fn(); await reload(); } catch (err) { toast(err.message, "error"); } finally { setBusy(""); }
  };
  const create = act("create", async () => {
    await api("/api/wallet", { method: "POST", body: { label: label.trim() } });
    toast(`Wallet "${label.trim()}" created`);
    setLabel("");
  });
  const makeDefault = (wallet) => act("default", async () => {
    await api(`/api/wallet/${wallet.id}`, { method: "PATCH", body: { is_default: true } });
    toast(`${wallet.label} is now your default wallet`);
  })();
  const reset = act("reset", async () => { await api("/api/wallet/paper-reset", { method: "POST" }); toast("Paper balances reset"); });

  if (!w) return <div className="empty">Loading wallets...</div>;
  const full = w.wallets.length >= w.limit;
  const current = open && w.wallets.find((x) => x.id === open);

  return (
    <>
      <div className="page-head">
        <div><h1>Wallets</h1><p>Dedicated trading wallets. Only you can withdraw from them or export their keys.</p></div>
        <span className="chip">{w.wallets.length} / {w.limit} WALLETS</span>
      </div>

      <div className="grid g3">
        <div className="panel stat"><small>{w.paper_trading ? "Total paper balance" : "Total balance"}</small><b>{sol(w.sol, 3)} SOL</b><small>{w.sol_usd ? usd(w.sol * w.sol_usd) : " "}</small></div>
        <div className="panel stat"><small>Wallets</small><b>{w.wallets.length}</b><small>plan allows {w.limit}</small></div>
        <div className="panel stat"><small>Network</small><b style={{ fontSize: 18 }}>{w.rpc_ok ? "Solana mainnet" : "RPC unreachable"}</b><small>{w.paper_trading ? "practice mode" : "live trading"}</small></div>
      </div>

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="panel-head"><h3>Your wallets</h3>{w.paper_trading && <button className="btn sm" disabled={busy === "reset"} onClick={reset}>Reset paper balances</button>}</div>
        {w.wallets.map((x) => (
          <div className="wallet-row" key={x.id}>
            <div style={{ minWidth: 0 }}>
              <div className="row"><b>{x.label}</b>{x.is_default && <span className="chip acc">DEFAULT</span>}</div>
              <div className="mono small dim" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{x.address}</div>
            </div>
            <div className="row wrap">
              <span className="mono" style={{ fontWeight: 700, marginRight: 6 }}>{sol(x.sol)} SOL</span>
              {!x.is_default && <button className="btn sm ghost" disabled={busy === "default"} onClick={() => makeDefault(x)}>Make default</button>}
              <button className="btn sm" onClick={() => setOpen(x.id)}><Icon name="wallet" />Manage</button>
            </div>
          </div>
        ))}
      </div>

      <form className="panel" style={{ marginTop: 14 }} onSubmit={create}>
        <div className="panel-head"><h3>Add a wallet</h3></div>
        <div className="panel-body stack">
          <p className="small mute">Use separate wallets to keep strategies apart, for example one for the auto-sniper and one for copy trading. Each wallet has its own balance, deposit address and private key.</p>
          <div className="row">
            <input className="input" required maxLength={32} placeholder="Wallet name, e.g. Sniper" value={label} disabled={full} onChange={(e) => setLabel(e.target.value)} />
            <button className="btn primary" disabled={full || busy === "create"}><Icon name="plus" />Create</button>
          </div>
          {full && <p className="small dim">Your plan allows {w.limit} wallet{w.limit === 1 ? "" : "s"}. Hunter allows 3, Apex 10 and Leviathan 50.</p>}
        </div>
      </form>

      {current && <WalletActions wallet={current} paper={w.paper_trading} onClose={() => setOpen(null)} onChanged={reload} />}
    </>
  );
}
