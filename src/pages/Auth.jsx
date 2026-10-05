import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { api, useAuth, useToast } from "../lib.jsx";
import { Brand, Field } from "../components/ui.jsx";

export default function Auth({ mode }) {
  const register = mode === "register";
  const { user, signIn } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ email: "", username: "", password: "", referral_code: params.get("ref") || "" });
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (user) return <Navigate to="/app" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = register
        ? { ...form, referral_code: form.referral_code || null }
        : { email: form.email, password: form.password };
      signIn(await api(`/api/auth/${register ? "register" : "login"}`, { method: "POST", body }));
      navigate("/app");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth land">
      <form className="auth-card stack" onSubmit={submit}>
        <Brand />
        <div>
          <h1 style={{ fontSize: 24, letterSpacing: "-0.02em" }}>{register ? "Create your account" : "Welcome back"}</h1>
          <p className="mute">{register ? "A trading wallet is created for you automatically." : "Sign in to your terminal."}</p>
        </div>
        <Field label="Email"><input className="input" type="email" required autoComplete="email" value={form.email} onChange={set("email")} /></Field>
        {register && (
          <Field label="Username" hint="shown on the leaderboard">
            <input className="input" required minLength={3} maxLength={20} pattern="[A-Za-z0-9_]+" value={form.username} onChange={set("username")} />
          </Field>
        )}
        <Field label="Password" hint={register ? "8+ characters" : null}>
          <input className="input" type="password" required minLength={register ? 8 : 1} autoComplete={register ? "new-password" : "current-password"} value={form.password} onChange={set("password")} />
        </Field>
        {register && (
          <>
            <Field label="Referral code" hint="optional"><input className="input mono" value={form.referral_code} onChange={set("referral_code")} /></Field>
            <label className="row small mute" style={{ alignItems: "flex-start" }}>
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: 3 }} />
              <span>I understand that trading new tokens is high risk, that I can lose everything I trade, and that nothing here is financial advice.</span>
            </label>
          </>
        )}
        <button className="btn primary lg block" disabled={busy || (register && !agree)}>
          {busy ? "Please wait..." : register ? "Create account" : "Sign in"}
        </button>
        <p className="mute small" style={{ textAlign: "center" }}>
          {register ? "Already have an account? " : "New to Nexus? "}
          <Link to={register ? "/login" : "/register"} className="up">{register ? "Sign in" : "Create one free"}</Link>
        </p>
      </form>
    </div>
  );
}
