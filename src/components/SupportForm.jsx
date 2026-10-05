import { useState } from "react";
import { api } from "../lib/api";

const TELEGRAM_HANDLE = import.meta.env.VITE_SUPPORT_TELEGRAM || "";
const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || "";

export default function SupportForm() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General Question");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg(null);
    try {
      await api.submitSupportTicket({ email, subject, message });
      setStatus("done");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message);
    }
  }

  return (
    <section className="max-w-2xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-nexus-accent mb-3">Support</p>
        <h2 className="font-display text-2xl md:text-3xl font-bold">We're here if something breaks</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {TELEGRAM_HANDLE && (
          <a
            href={`https://t.me/${TELEGRAM_HANDLE.replace("@", "")}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-nexus-line bg-nexus-panel p-4 hover:border-nexus-accent/50 transition-colors"
          >
            <p className="text-sm font-semibold text-nexus-text">Telegram</p>
            <p className="text-xs text-nexus-muted mt-1">{TELEGRAM_HANDLE} — fastest response</p>
          </a>
        )}
        {SUPPORT_EMAIL && (
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="rounded-xl border border-nexus-line bg-nexus-panel p-4 hover:border-nexus-accent/50 transition-colors"
          >
            <p className="text-sm font-semibold text-nexus-text">Email</p>
            <p className="text-xs text-nexus-muted mt-1">{SUPPORT_EMAIL}</p>
          </a>
        )}
      </div>

      {status === "done" ? (
        <p className="text-center text-nexus-accent font-medium">
          Ticket submitted — we'll get back to you.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg bg-nexus-panel border border-nexus-line px-4 py-3 text-sm text-nexus-text placeholder:text-nexus-muted/60 outline-none focus:border-nexus-accent"
          />
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-lg bg-nexus-panel border border-nexus-line px-4 py-3 text-sm text-nexus-text outline-none focus:border-nexus-accent"
          >
            <option>General Question</option>
            <option>Trade Issue</option>
            <option>Wallet / Withdrawal</option>
            <option>Autopilot</option>
            <option>Bug Report</option>
          </select>
          <textarea
            required
            placeholder="What's going on?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full rounded-lg bg-nexus-panel border border-nexus-line px-4 py-3 text-sm text-nexus-text placeholder:text-nexus-muted/60 outline-none focus:border-nexus-accent resize-none"
          />
          {errorMsg && <p className="text-xs text-nexus-warn">{errorMsg}</p>}
          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full rounded-lg bg-nexus-accent text-nexus-bg font-semibold py-3 text-sm hover:brightness-110 transition-all disabled:opacity-50"
          >
            {status === "submitting" ? "Submitting..." : "Submit Ticket"}
          </button>
        </form>
      )}
    </section>
  );
}
