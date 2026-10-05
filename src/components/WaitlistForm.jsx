import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import TurnstileWidget from "./TurnstileWidget";

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export default function WaitlistForm() {
  const [contact, setContact] = useState("");
  const [token, setToken] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | submitting | done | error
  const [errorMsg, setErrorMsg] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!token) {
      setErrorMsg("Please complete the human verification first.");
      return;
    }

    setStatus("submitting");
    setErrorMsg(null);

    try {
      const res = await fetch(`${API_BASE}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, turnstileToken: token }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Something went wrong.");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message);
    }
  }

  if (status === "done") {
    return (
      <div className="text-center py-6">
        <CheckCircle2 className="mx-auto text-nexus-accent mb-2" size={24} />
        <p className="text-nexus-accent font-semibold text-lg">You're on the list</p>
        <p className="text-nexus-muted text-sm mt-1">We'll reach out when your access is ready.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-4">
      <input
        type="text"
        required
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        placeholder="Email or Telegram @handle"
        className="w-full rounded-lg bg-nexus-panel border border-nexus-line px-4 py-3 text-sm text-nexus-text placeholder:text-nexus-muted/60 outline-none focus:border-nexus-accent transition-colors"
      />

      <div className="flex justify-center">
        <TurnstileWidget siteKey={TURNSTILE_SITE_KEY} onVerify={setToken} onExpire={() => setToken(null)} />
      </div>

      {errorMsg && <p className="text-xs text-nexus-warn text-center">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-lg bg-nexus-accent text-nexus-bg font-semibold py-3 text-sm hover:brightness-110 transition-all disabled:opacity-50"
      >
        {status === "submitting" ? "Joining..." : "Request Early Access"}
      </button>
    </form>
  );
}
