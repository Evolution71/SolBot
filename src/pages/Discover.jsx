import { useState } from "react";
import { age, api, pct, price, tone, usd, usePoll, useToast } from "../lib.jsx";
import TradeModal from "../components/TradeModal.jsx";
import { TokenCell } from "../components/ui.jsx";

export default function Discover() {
  const toast = useToast();
  const [kind, setKind] = useState("new");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [mint, setMint] = useState(null);
  const [searching, setSearching] = useState(false);
  const { data, error } = usePoll(`/api/market/feed?kind=${kind}`, 8000);

  const search = async (e) => {
    e.preventDefault();
    if (!query.trim()) return setResults(null);
    setSearching(true);
    try {
      const r = await api(`/api/market/search?q=${encodeURIComponent(query.trim())}`);
      setResults(r.tokens);
      if (!r.tokens.length) toast("No Solana token with a SOL pool matched that search", "error");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSearching(false);
    }
  };

  const tokens = results ?? data?.tokens ?? [];
  return (
    <>
      <div className="page-head">
        <div><h1>Discover</h1><p>Fresh pools and trending tokens on Solana. Click a token to check it and trade.</p></div>
        <form className="row" onSubmit={search} style={{ flex: "1 1 320px", maxWidth: 460 }}>
          <input className="input mono" placeholder="Search name or paste token address" value={query} onChange={(e) => { setQuery(e.target.value); if (!e.target.value) setResults(null); }} />
          <button className="btn" disabled={searching}>{searching ? "..." : "Search"}</button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-head">
          {results ? (
            <div className="row"><h3>Search results</h3><button className="btn sm" onClick={() => { setResults(null); setQuery(""); }}>Clear</button></div>
          ) : (
            <div className="tabs">
              <button className={kind === "new" ? "on" : ""} onClick={() => setKind("new")}>New pools</button>
              <button className={kind === "trending" ? "on" : ""} onClick={() => setKind("trending")}>Trending</button>
            </div>
          )}
          <span className="chip acc"><span className="dot" />{tokens.length} TOKENS</span>
        </div>
        <div className="table-wrap">
          {tokens.length ? (
            <table>
              <thead>
                <tr><th>Token</th><th className="right">Age</th><th className="right">Price</th><th className="right">5m</th><th className="right">1h</th>
                  <th className="right">Liquidity</th><th className="right">Mkt cap</th><th className="right">Vol 1h</th><th className="right">Buys/Sells</th><th /></tr>
              </thead>
              <tbody>
                {tokens.map((t) => (
                  <tr key={t.mint} onClick={() => setMint(t.mint)} style={{ cursor: "pointer" }}>
                    <td><TokenCell t={t} /></td>
                    <td className="right mono mute">{age(t.age_minutes)}</td>
                    <td className="right mono">{price(t.price_usd)}</td>
                    <td className={`right mono ${tone(t.change_m5)}`}>{pct(t.change_m5)}</td>
                    <td className={`right mono ${tone(t.change_h1)}`}>{pct(t.change_h1)}</td>
                    <td className="right mono">{usd(t.liquidity_usd)}</td>
                    <td className="right mono">{usd(t.market_cap)}</td>
                    <td className="right mono">{usd(t.volume_h1)}</td>
                    <td className="right mono"><span className="up">{t.buys_h1}</span> / <span className="down">{t.sells_h1}</span></td>
                    <td className="right"><button className="btn primary sm">Trade</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div className="empty">{error || (data ? "The feed is quiet right now. It refreshes every few seconds." : "Loading live feed...")}</div>}
        </div>
      </div>
      {mint && <TradeModal mint={mint} onClose={() => setMint(null)} />}
    </>
  );
}
