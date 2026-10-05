import { useEffect, useState } from "react";
import { api } from "../lib/api";
import WalletCard from "./WalletCard";
import ReferralCard from "./ReferralCard";
import TradeHistory from "./TradeHistory";
import Leaderboard from "./Leaderboard";
import PnlCard from "./PnlCard";
import LiveFeed from "./LiveFeed";
import ExecutionParameters from "./ExecutionParameters";
import StrategyPresets from "./StrategyPresets";
import DashboardNav from "./DashboardNav";
import TradePanel from "./TradePanel";
import TermsGate from "./TermsGate";
import SettingsPage from "./SettingsPage";
import QuickStartCard from "./QuickStartCard";

export default function Dashboard() {
  const [tab, setTab] = useState("overview");
  const [summary, setSummary] = useState(null);
  const [trades, setTrades] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [pnl, setPnl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [summaryRes, tradesRes, lbRes, pnlRes] = await Promise.all([
          api.getMySummary(),
          api.getMyTrades(10),
          api.getLeaderboard(),
          api.getMyPnl(),
        ]);
        if (cancelled) return;
        setSummary(summaryRes);
        setTrades(tradesRes.trades);
        setLeaderboard(lbRes.entries);
        setPnl(pnlRes);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-center text-nexus-muted py-12">Loading your dashboard...</p>;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <p className="text-nexus-warn font-medium">Couldn't load your dashboard.</p>
        <p className="text-sm text-nexus-muted mt-2">{error}</p>
        <p className="text-xs text-nexus-muted mt-4">
          Make sure VITE_API_BASE_URL points at your Railway backend, and that your session hasn't
          expired — try disconnecting and logging in again.
        </p>
      </div>
    );
  }

  return (
    <div>
      <DashboardNav active={tab} onChange={setTab} />

      <div className="max-w-4xl mx-auto px-6 py-8">
        {tab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuickStartCard onNavigate={setTab} />
            <PnlCard pnl={pnl} />
            <WalletCard wallet={summary?.wallet} />
            <ReferralCard referral={summary?.referral} />
            <LiveFeed limit={6} />
          </div>
        )}

        {tab === "trade" && (
          <TermsGate>
            <TradePanel />
          </TermsGate>
        )}

        {tab === "autopilot" && (
          <div className="space-y-6">
            <StrategyPresets />
            <ExecutionParameters />
          </div>
        )}

        {tab === "history" && <TradeHistory trades={trades} />}

        {tab === "leaderboard" && <Leaderboard entries={leaderboard} />}

        {tab === "settings" && <SettingsPage />}
      </div>
    </div>
  );
}
