import { useState } from "react";
import { ArrowDownUp, ShieldAlert, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { api } from "../lib/api";
import { toast } from "./ToastHost";

const RISK_COLOR = { low: "text-nexus-accent", medium: "text-yellow-400", high: "text-nexus-warn" };
const BUY_PRESETS = [0.05, 0.1, 0.5, 1];
const SELL_PRESETS = [25, 50, 75, 100];
const TP_PRESETS = [25, 50, 100];
const SL_PRESETS = [10, 20, 30];

export default function TradePanel() {
  const [side, setSide] = useState("buy");
  const [tokenMint, setTokenMint] = useState("");
  const [amount, setAmount] = useState(""); // SOL for buy, % for sell
  const [takeProfitPct, setTakeProfitPct] = useState("");
  const [stopLossPct, setStopLossPct] = useState("");
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | previewing | ready | executing | done | error
  const [error, setError] = useState(null);

  async function handlePreview(e) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setStatus("previewing");
    try {
      if (side === "buy") {
        const res = await api.previewBuy(tokenMint, Number(amount));
        setPreview(res);
      } else {
        const res = await api.previewSellTrade(tokenMint, Number(amount));
        setPreview(res);
      }
      setStatus("ready");
    } catch (err) {
      setError(err.message);
      setStatus("idle");
      if (err.message?.includes("risk disclosure")) {
        setError(`${err.message} — accept it in Settings first.`);
      }
    }
  }

  async function handleExecute() {
    setStatus("executing");
    setError(null);
    try {
      if (side === "buy") {
        const res = await api.executeBuy(
          tokenMint,
          Number(amount),
          takeProfitPct ? Number(takeProfitPct) : undefined,
          stopLossPct ? Number(stopLossPct) : undefined
        );
        setResult(res);
        toast("Buy executed", "success");
      } else {
        const res = await api.executeSell(tokenMint, Number(amount));
        setResult(res);
        toast("Sell executed", "success");
      }
      setStatus("done");
      setPreview(null);
    } catch (err) {
      setError(err.message);
      setStatus("ready");
      toast(err.message, "error");
    }
  }

  function reset() {
    setPreview(null);
    setResult(null);
    setStatus("idle");
    setError(null);
  }

  const amountPresets = side === "buy" ? BUY_PRESETS : SELL_PRESETS;
  const amountUnit = side === "buy" ? "SOL" : "%";

  return (
    <div className="rounded-2xl border border-nexus-line bg-nexus-panel p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-nexus-muted flex items-center gap-2">
          <ArrowDownUp size={14} /> Trade
        </p>
        <div className="flex rounded-lg border border-nexus-line overflow-hidden text-xs">
          {["buy", "sell"].map((s) => (
            <button
              key={s}
              onClick={() => {
                setSide(s);
                setAmount("");
                reset();
              }}
              className={`px-4 py-1.5 font-medium capitalize transition-colors ${
                side === s ? "bg-nexus-accent text-nexus-bg" : "text-nexus-muted"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {status === "done" && result ? (
        <div className="text-center py-6">
          <CheckCircle2 className="mx-auto text-nexus-accent mb-3" size={32} />
          <p className="font-semibold text-nexus-text">Trade executed</p>
          <p className="text-xs text-nexus-muted mt-1 font-mono break-all">{result.signature}</p>
          <a
            href={`https://solscan.io/tx/${result.signature}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-nexus-accent underline mt-2 inline-block"
          >
            View on Solscan →
          </a>
          <button
            onClick={reset}
            className="block mx-auto mt-4 text-xs text-nexus-muted hover:text-nexus-accent"
          >
            New trade
          </button>
        </div>
      ) : (
        <form onSubmit={handlePreview} className="space-y-4">
          <input
            type="text"
            required
            value={tokenMint}
            onChange={(e) => setTokenMint(e.target.value)}
            placeholder="Token address"
            className="w-full rounded-lg bg-nexus-bg border border-nexus-line px-4 py-3 text-sm font-mono text-nexus-text placeholder:text-nexus-muted/60 outline-none focus:border-nexus-accent"
          />

          <div>
            <input
              type="number"
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={side === "buy" ? "SOL amount to spend" : "Percent of holding to sell"}
              className="w-full rounded-lg bg-nexus-bg border border-nexus-line px-4 py-3 text-sm text-nexus-text placeholder:text-nexus-muted/60 outline-none focus:border-nexus-accent"
            />
            <div className="flex gap-2 mt-2">
              {amountPresets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(String(p))}
                  className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition-colors ${
                    Number(amount) === p
                      ? "border-nexus-accent text-nexus-accent bg-nexus-accent/10"
                      : "border-nexus-line text-nexus-muted hover:text-nexus-text"
                  }`}
                >
                  {p}
                  {amountUnit === "%" ? "%" : ""}
                </button>
              ))}
            </div>
          </div>

          {side === "buy" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-nexus-muted mb-1.5">Take-profit % (optional)</p>
                <div className="flex gap-1.5">
                  {TP_PRESETS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setTakeProfitPct(String(p) === takeProfitPct ? "" : String(p))}
                      className={`flex-1 rounded-md border py-1.5 text-[11px] font-medium transition-colors ${
                        takeProfitPct === String(p)
                          ? "border-nexus-accent text-nexus-accent bg-nexus-accent/10"
                          : "border-nexus-line text-nexus-muted"
                      }`}
                    >
                      +{p}%
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-nexus-muted mb-1.5">Stop-loss % (optional)</p>
                <div className="flex gap-1.5">
                  {SL_PRESETS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setStopLossPct(String(p) === stopLossPct ? "" : String(p))}
                      className={`flex-1 rounded-md border py-1.5 text-[11px] font-medium transition-colors ${
                        stopLossPct === String(p)
                          ? "border-nexus-warn text-nexus-warn bg-nexus-warn/10"
                          : "border-nexus-line text-nexus-muted"
                      }`}
                    >
                      -{p}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {preview && (
            <div className="rounded-lg border border-nexus-line bg-nexus-bg p-4 space-y-2 text-xs">
              {preview.risk && (
                <div className="flex items-center gap-2">
                  <ShieldAlert size={14} className={RISK_COLOR[preview.risk.level]} />
                  <span className={RISK_COLOR[preview.risk.level]}>
                    Risk: {preview.risk.level.toUpperCase()} ({preview.risk.score}/100)
                  </span>
                </div>
              )}
              <p className="text-nexus-muted">
                Price impact: {(Number(preview.preview.priceImpactPct) * 100).toFixed(2)}%
              </p>
              <p className="text-nexus-muted">
                Fee: {preview.fee.feeBps === 0 ? "FREE" : `${(preview.fee.feeBps / 100).toFixed(2)}%`} —{" "}
                {preview.fee.reason}
              </p>
            </div>
          )}

          {error && (
            <p className="text-xs text-nexus-warn flex items-start gap-1.5">
              <XCircle size={14} className="mt-0.5 shrink-0" /> {error}
            </p>
          )}

          {status === "ready" ? (
            <button
              type="button"
              onClick={handleExecute}
              disabled={status === "executing"}
              className="w-full rounded-lg bg-nexus-accent text-nexus-bg font-semibold py-3 text-sm hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === "executing" && <Loader2 size={16} className="animate-spin" />}
              Confirm {side === "buy" ? "Buy" : "Sell"}
            </button>
          ) : (
            <button
              type="submit"
              disabled={status === "previewing"}
              className="w-full rounded-lg border border-nexus-line text-nexus-text font-semibold py-3 text-sm hover:border-nexus-accent transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === "previewing" && <Loader2 size={16} className="animate-spin" />}
              Get Quote
            </button>
          )}
        </form>
      )}
    </div>
  );
}
