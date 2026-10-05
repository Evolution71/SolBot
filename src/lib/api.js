const BASE = import.meta.env.VITE_API_BASE_URL || "/api";

function getToken() {
  return localStorage.getItem("nexus_session_token") || "";
}

async function request(path, opts = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });

  if (res.status === 401) {
    // Session expired or invalid -- clear it so the UI falls back to the
    // login widget instead of looping on failed requests.
    localStorage.removeItem("nexus_session_token");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  loginWithTelegram: (payload) =>
    request("/auth/telegram", { method: "POST", body: JSON.stringify(payload) }),
  getLeaderboard: () => request("/leaderboard"),
  getMySummary: () => request("/me/summary"),
  getMyTrades: (limit = 20) => request(`/me/trades?limit=${limit}`),
  getMyPnl: () => request("/me/pnl"),
  getFeed: (limit = 20) => request(`/feed?limit=${limit}`),
  getEcosystemStats: () => request("/ecosystem"),
  getAutopilotSettings: () => request("/me/autopilot"),
  updateAutopilotSettings: (patch) =>
    request("/me/autopilot", { method: "PUT", body: JSON.stringify(patch) }),
  acceptAutopilotTerms: () => request("/me/autopilot/accept", { method: "POST" }),
  submitSupportTicket: (payload) =>
    request("/support", { method: "POST", body: JSON.stringify(payload) }),
  getTermsStatus: () => request("/me/terms"),
  acceptTerms: () => request("/me/terms/accept", { method: "POST" }),
  previewBuy: (tokenMint, solAmount) =>
    request("/me/trade/preview-buy", { method: "POST", body: JSON.stringify({ tokenMint, solAmount }) }),
  executeBuy: (tokenMint, solAmount, takeProfitPct, stopLossPct) =>
    request("/me/trade/buy", {
      method: "POST",
      body: JSON.stringify({ tokenMint, solAmount, takeProfitPct, stopLossPct }),
    }),
  previewSellTrade: (tokenMint, percent) =>
    request("/me/trade/preview-sell", { method: "POST", body: JSON.stringify({ tokenMint, percent }) }),
  executeSell: (tokenMint, percent) =>
    request("/me/trade/sell", { method: "POST", body: JSON.stringify({ tokenMint, percent }) }),
};

export function saveSession(token) {
  localStorage.setItem("nexus_session_token", token);
}

export function clearSession() {
  localStorage.removeItem("nexus_session_token");
}

export function hasSession() {
  return Boolean(getToken());
}
