const STEPS = [
  { n: "01", title: "Open the bot", body: "Start a chat with the Telegram bot — it generates you a dedicated trading wallet instantly." },
  { n: "02", title: "Fund it", body: "Send SOL to your generated address. Only what you deposit is ever at risk." },
  { n: "03", title: "Set your rules", body: "Trade manually with a confirm-first preview, or configure Autopilot once and let it run." },
  { n: "04", title: "Exit automatically", body: "Attach a take-profit and stop-loss to any position — it closes itself when a target is hit." },
];

export default function HowItWorks() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <p className="text-xs uppercase tracking-[0.25em] text-nexus-accent mb-3">How it works</p>
        <h2 className="font-display text-2xl md:text-3xl font-bold">From zero to automated in minutes</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {STEPS.map((s) => (
          <div key={s.n} className="relative">
            <span className="font-mono text-4xl font-bold text-nexus-accent/30">{s.n}</span>
            <h3 className="mt-2 font-semibold text-nexus-text">{s.title}</h3>
            <p className="mt-1.5 text-sm text-nexus-muted leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
