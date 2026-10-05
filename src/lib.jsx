import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
const TOKEN_KEY = "nexus_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

export async function api(path, { method = "GET", body } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (getToken()) headers.Authorization = `Bearer ${getToken()}`;
  let res;
  try {
    res = await fetch(BASE + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new Error("Cannot reach the server - check your connection");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const d = data.detail;
    const msg = Array.isArray(d) ? d.map((e) => `${e.loc?.slice(-1)[0] ?? "field"}: ${e.msg}`).join("; ") : d;
    const err = new Error(msg || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/* ---------- formatting ---------- */
export const sol = (n, d = 4) => (n == null ? "-" : Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }));
export const signed = (n, d = 4) => (n == null ? "-" : `${n >= 0 ? "+" : ""}${sol(n, d)}`);
export const pct = (n, d = 1) => (n == null ? "-" : `${n >= 0 ? "+" : ""}${Number(n).toFixed(d)}%`);
export const tone = (n) => (n == null || n === 0 ? "" : n > 0 ? "up" : "down");
export const short = (a, n = 4) => (a ? `${a.slice(0, n)}...${a.slice(-n)}` : "");
export function usd(n) {
  if (n == null) return "-";
  const a = Math.abs(n);
  if (a >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (a >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(a >= 1 ? 2 : 4)}`;
}
export function price(n) {
  if (!n) return "-";
  if (n >= 1) return `$${n.toFixed(2)}`;
  const zeros = Math.max(0, -Math.floor(Math.log10(n)) - 1);
  return `$${n.toFixed(Math.min(12, zeros + 4))}`;
}
export function age(minutes) {
  if (minutes == null) return "-";
  if (minutes < 60) return `${Math.max(0, Math.round(minutes))}m`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
  return `${Math.floor(minutes / 1440)}d`;
}
/* The API returns naive UTC timestamps. */
export const toDate = (s) => (s ? new Date(/Z|[+-]\d\d:\d\d$/.test(s) ? s : `${s}Z`) : null);
export const when = (s) => (s ? toDate(s).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-");
export const clock = (ms) => new Date(ms).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });

/* ---------- auth ---------- */
const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    if (!getToken()) { setUser(null); return null; }
    try {
      const me = await api("/api/auth/me");
      setUser(me);
      return me;
    } catch (e) {
      if (e.status === 401) { setToken(null); setUser(null); }
      return null;
    }
  }, []);

  useEffect(() => { refresh().finally(() => setReady(true)); }, [refresh]);

  const signIn = (data) => { setToken(data.token); setUser(data.user); };
  const signOut = () => { setToken(null); setUser(null); };
  return <AuthCtx.Provider value={{ user, ready, refresh, signIn, signOut }}>{children}</AuthCtx.Provider>;
}

/* ---------- toasts ---------- */
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((text, kind = "ok") => {
    const id = Math.random();
    setItems((x) => [...x.slice(-3), { id, text, kind }]);
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), kind === "error" ? 6500 : 4000);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" role="status">
        {items.map((t) => <div key={t.id} className={`toast ${t.kind}`}>{t.text}</div>)}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------- data polling ---------- */
export function usePoll(path, ms = 0, enabled = true) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const alive = useRef(true);
  const load = useCallback(async () => {
    if (!path) return;
    try {
      const d = await api(path);
      if (alive.current) { setData(d); setError(null); }
    } catch (e) {
      if (alive.current) setError(e.message);
    }
  }, [path]);
  useEffect(() => {
    alive.current = true;
    if (!enabled) return () => { alive.current = false; };
    load();
    const id = ms ? setInterval(() => { if (!document.hidden) load(); }, ms) : null;
    return () => { alive.current = false; if (id) clearInterval(id); };
  }, [load, ms, enabled]);
  return { data, error, reload: load, setData };
}
