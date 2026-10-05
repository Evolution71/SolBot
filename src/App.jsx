import { useCallback, useState } from "react";
import Dashboard from "./components/Dashboard";
import Landing from "./components/Landing";
import ToastHost from "./components/ToastHost";
import { api, saveSession, clearSession, hasSession } from "./lib/api";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(hasSession());
  const [authError, setAuthError] = useState(null);

  const handleAuth = useCallback(async (telegramUser) => {
    setAuthError(null);
    try {
      const { token } = await api.loginWithTelegram(telegramUser);
      saveSession(token);
      setLoggedIn(true);
    } catch (err) {
      setAuthError(err.message);
    }
  }, []);

  function handleDisconnect() {
    clearSession();
    setLoggedIn(false);
  }

  if (loggedIn) {
    return (
      <div className="min-h-screen">
        <header className="flex items-center justify-between px-6 py-5 border-b border-nexus-line">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="CrystalSolTrades" className="h-9 w-9 rounded-lg" />
            <span className="font-display font-semibold tracking-tight text-lg">CrystalSolTrades</span>
          </div>
          <button
            onClick={handleDisconnect}
            className="text-xs text-nexus-muted hover:text-nexus-warn transition-colors"
          >
            Disconnect
          </button>
        </header>
        <Dashboard />
        <footer className="text-center text-xs text-nexus-muted py-8 border-t border-nexus-line">
          Non-custodial. Your bot wallet, your keys — export anytime with /export.
        </footer>
        <ToastHost />
      </div>
    );
  }

  return (
    <>
      <Landing onAuth={handleAuth} authError={authError} />
      <ToastHost />
    </>
  );
}
