import { Bot, ShieldCheck, Target, Lock, Percent, Trophy } from "lucide-react";

const FEATURES = [
  {
    icon: Bot,
    title: "Autopilot Sniping",
    body: "Configure your budget, risk tolerance, and take-profit/stop-loss once. From then on, every new token that clears your filters is bought automatically — no manual confirmation needed.",
  },
  {
    icon: ShieldCheck,
    title: "Real Risk Analysis",
    body: "Every token is screened for mint/freeze authority, holder concentration, and liquidity depth before you trade — shown right in the confirmation screen, not buried in a menu.",
  },
  {
    icon: Target,
    title: "Take-Profit / Stop-Loss",
    body: "Set a target and a floor when you buy. A live monitor checks every open position and exits automatically the moment either is hit — while you do something else entirely.",
  },
  {
    icon: Lock,
    title: "Non-Custodial Wallets",
    body: "Every user gets a dedicated, encrypted trading wallet. We never ask for your main wallet's private key or seed phrase — export yours anytime, no lock-in.",
  },
  {
    icon: Percent,
    title: "Transparent Fees",
    body: "A flat 1% per trade, published and verifiable on-chain. Your first 3 trades are free, and real referrals lower your rate permanently.",
  },
  {
    icon: Trophy,
    title: "Live Leaderboard",
    body: "Real weekly rankings by actual SOL volume traded — pulled straight from the trade ledger, never inflated.",
  },
];

export default function FeatureGrid() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <p className="text-xs uppercase tracking-[0.25em] text-nexus-accent mb-3">Features</p>
        <h2 className="font-display text-2xl md:text-3xl font-bold">Built to actually run, not just look good</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-nexus-line bg-nexus-panel p-6 hover:border-nexus-accent/50 transition-colors"
          >
            <f.icon className="text-nexus-accent" size={26} strokeWidth={1.75} />
            <h3 className="mt-4 font-semibold text-nexus-text">{f.title}</h3>
            <p className="mt-2 text-sm text-nexus-muted leading-relaxed">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
