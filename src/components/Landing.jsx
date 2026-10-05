import { Rocket, LogIn } from "lucide-react";
import WalletConnect from "./WalletConnect";
import FeatureGrid from "./FeatureGrid";
import HowItWorks from "./HowItWorks";
import FeeTransparency from "./FeeTransparency";
import WaitlistForm from "./WaitlistForm";
import TelegramLoginButton from "./TelegramLoginButton";
import LiveFeed from "./LiveFeed";
import EcosystemStats from "./EcosystemStats";
import SupportForm from "./SupportForm";

const BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || "";

export default function Landing({ onAuth, authError }) {
  function scrollToLogin() {
    document.getElementById("sign-in")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div>
      <header className="flex items-center justify-between px-6 py-5 border-b border-nexus-line">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="CrystalSolTrades" className="h-9 w-9 rounded-lg" />
          <span className="font-display font-semibold tracking-tight text-lg">CrystalSolTrades</span>
        </div>
        <div className="flex items-center gap-3">
          <WalletConnect />
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center py-20 px-6 grid-fade text-center">
        <h1 className="font-display text-4xl md:text-6xl font-bold max-w-3xl">
          Automated Solana trading,
          <span className="text-nexus-accent"> run entirely from your browser</span>
        </h1>
        <p className="mt-5 text-nexus-muted max-w-xl">
          Real risk analysis. Real take-profit and stop-loss automation. Real fees, published
          on-chain. Trade, configure Autopilot, and track every position — all on the website.
        </p>

        <button
          onClick={scrollToLogin}
          className="mt-8 flex items-center gap-2 rounded-lg bg-nexus-accent text-nexus-bg font-semibold px-8 py-3.5 text-sm hover:brightness-110 transition-all"
        >
          <Rocket size={16} /> Launch App
        </button>
      </section>

      <FeatureGrid />
      <HowItWorks />

      {/* Live proof, not screenshots */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-nexus-accent mb-3">See it running</p>
          <h2 className="font-display text-2xl md:text-3xl font-bold">
            Real detections, real network data — right now
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LiveFeed limit={6} title="Recently Scanned Tokens" />
          <EcosystemStats />
        </div>
      </section>

      <FeeTransparency />

      {/* Sign in */}
      <section id="sign-in" className="max-w-sm mx-auto px-6 py-16 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-nexus-muted mb-4 flex items-center justify-center gap-1.5">
          <LogIn size={12} /> Sign in
        </p>
        <h2 className="font-display text-xl font-bold mb-2">Launch your dashboard</h2>
        <p className="text-xs text-nexus-muted mb-6">
          One-tap sign-in — trading, Autopilot, and settings all happen right here on the website
          afterward. No app to install.
        </p>
        <TelegramLoginButton botUsername={BOT_USERNAME} onAuth={onAuth} />
        {authError && <p className="text-xs text-nexus-warn text-center mt-3">{authError}</p>}
      </section>

      {/* Waitlist */}
      <section className="max-w-lg mx-auto px-6 py-16 text-center border-t border-nexus-line">
        <p className="text-xs uppercase tracking-[0.25em] text-nexus-accent mb-3">Early Access</p>
        <h2 className="font-display text-2xl font-bold mb-3">Get notified about new features</h2>
        <p className="text-nexus-muted text-sm mb-8">
          Human verification required — no bots, no spam signups.
        </p>
        <WaitlistForm />
      </section>

      <SupportForm />

      <footer className="text-center text-xs text-nexus-muted py-8 border-t border-nexus-line">
        CrystalSolTrades — non-custodial. Your wallet, your keys — export anytime from Settings.
      </footer>
    </div>
  );
}
