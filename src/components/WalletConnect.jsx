import { useCallback, useEffect, useState } from "react";

function truncate(address) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

/**
 * Connects directly to whichever Solana wallet extension the visitor has
 * installed (Phantom, Solflare, Backpack all inject a compatible provider),
 * without pulling in the full @solana/wallet-adapter package tree. This is
 * intentionally minimal: it's for visitors to prove/display their own
 * wallet on the site (e.g. before a future feature that reads their
 * public balance or verifies holdings) — it is NOT how the bot's trading
 * wallets work. Those are generated and held separately per Telegram user;
 * see backend/src/services/walletService.ts. Connecting a wallet here never
 * gives this site or the bot any access to move funds from it.
 */
export default function WalletConnect() {
  const [address, setAddress] = useState(null);
  const [error, setError] = useState(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const provider = window?.solana;
    if (provider?.isConnected && provider?.publicKey) {
      setAddress(provider.publicKey.toString());
    }
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    const provider = window?.solana ?? window?.solflare;

    if (!provider) {
      setError("No Solana wallet extension found — install Phantom or Solflare first.");
      return;
    }

    try {
      setConnecting(true);
      const resp = await provider.connect();
      setAddress(resp.publicKey.toString());
    } catch (err) {
      setError(err?.message || "Connection was cancelled.");
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    const provider = window?.solana ?? window?.solflare;
    try {
      await provider?.disconnect();
    } finally {
      setAddress(null);
    }
  }, []);

  if (address) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-nexus-line bg-nexus-panel px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-nexus-accent" />
        <span className="font-mono text-xs text-nexus-text">{truncate(address)}</span>
        <button
          onClick={disconnect}
          className="text-xs text-nexus-muted hover:text-nexus-warn transition-colors ml-1"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={connect}
        disabled={connecting}
        className="rounded-lg border border-nexus-line bg-nexus-panel px-4 py-2 text-sm font-medium text-nexus-text hover:border-nexus-accent transition-colors disabled:opacity-50"
      >
        {connecting ? "Connecting..." : "Connect Wallet"}
      </button>
      {error && <span className="text-xs text-nexus-warn max-w-[220px] text-right">{error}</span>}
    </div>
  );
}
