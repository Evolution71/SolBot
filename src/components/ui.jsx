import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../lib.jsx";

const paths = {
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  radar: "M12 3a9 9 0 1 0 9 9M12 7a5 5 0 1 0 5 5M12 12l7-7",
  target: "M12 2v5M12 17v5M2 12h5M17 12h5M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  layers: "M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5",
  users: "M16 20v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 20v-1a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  wallet: "M3 7a2 2 0 0 1 2-2h13v4M3 7v10a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2zM17 14h.01",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7l1-8z",
  gift: "M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7S10 2 7.5 2a2.5 2.5 0 0 0 0 5H12zm0 0s2-5 4.5-5a2.5 2.5 0 0 1 0 5H12z",
  trophy: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3",
  shield: "M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5l8-3z",
  menu: "M3 6h18M3 12h18M3 18h18",
  copy: "M9 9h11v11H9zM5 15H4V4h11v1",
  out: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  link: "M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1",
  share: "M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13",
};

export function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

export function Logo() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#0e1415" stroke="#2a393b" />
      <circle cx="16" cy="16" r="7.5" fill="none" stroke="#b8ff3b" strokeWidth="2" />
      <path d="M16 4v6M16 22v6M4 16h6M22 16h6" stroke="#b8ff3b" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="16" r="2" fill="#b8ff3b" />
    </svg>
  );
}

export const Brand = ({ to = "/" }) => (
  <Link to={to} className="brand"><Logo /><span>NEXUS <em>SOL</em></span></Link>
);

export function TokenCell({ t }) {
  const [broken, setBroken] = useState(false);
  return (
    <div className="token">
      {t.image && !broken
        ? <img src={t.image} alt="" loading="lazy" onError={() => setBroken(true)} />
        : <span className="ph">{(t.symbol || "?").slice(0, 2).toUpperCase()}</span>}
      <div><b>{t.symbol}</b><small>{t.name}</small></div>
    </div>
  );
}

export function Modal({ onClose, wide, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? "wide" : ""}`} role="dialog" aria-modal="true">{children}</div>
    </div>
  );
}

export function CopyBox({ value, label = "Copied" }) {
  const toast = useToast();
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); toast(label); } catch { toast("Copy failed - select and copy manually", "error"); }
  };
  return (
    <div className="copybox">
      <code>{value}</code>
      <button className="btn sm" onClick={copy}><Icon name="copy" />Copy</button>
    </div>
  );
}

export const Switch = ({ checked, onChange, disabled }) => (
  <label className="switch"><input type="checkbox" checked={!!checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} /><i /></label>
);

export function Field({ label, hint, children }) {
  return <label className="field"><span>{label}{hint && <em className="dim" style={{ fontStyle: "normal" }}> - {hint}</em>}</span>{children}</label>;
}

export function Num({ value, onChange, ...rest }) {
  return <input className="input mono" type="number" inputMode="decimal" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} {...rest} />;
}

export const Upgrade = ({ text }) => (
  <div className="lock-card">
    <div><b>{text}</b><div className="mute small">Upgrade your plan to unlock it.</div></div>
    <Link to="/app/plans" className="btn primary sm">View plans</Link>
  </div>
);

export function Score({ value }) {
  const color = value >= 75 ? "var(--acc)" : value >= 50 ? "var(--amber)" : "var(--red)";
  const c = 2 * Math.PI * 31;
  return (
    <div className="score" title="Safety score">
      <svg width="74" height="74"><circle cx="37" cy="37" r="31" fill="none" stroke="var(--line)" strokeWidth="6" />
        <circle cx="37" cy="37" r="31" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} /></svg>
      <b style={{ color }}>{value}</b>
    </div>
  );
}

export const solscan = (sig) => `https://solscan.io/tx/${sig}`;
