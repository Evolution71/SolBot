import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import { AuthProvider, ToastProvider, useAuth } from "./lib.jsx";
import Admin from "./pages/Admin.jsx";
import Auth from "./pages/Auth.jsx";
import Copy from "./pages/Copy.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Discover from "./pages/Discover.jsx";
import Landing from "./pages/Landing.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import Plans from "./pages/Plans.jsx";
import Positions from "./pages/Positions.jsx";
import Referrals from "./pages/Referrals.jsx";
import Sniper from "./pages/Sniper.jsx";
import Wallet from "./pages/Wallet.jsx";
import "./styles.css";

function Private({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="auth mute">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Auth mode="login" />} />
      <Route path="/register" element={<Auth mode="register" />} />
      <Route path="/app" element={<Private><Layout /></Private>}>
        <Route index element={<Dashboard />} />
        <Route path="discover" element={<Discover />} />
        <Route path="sniper" element={<Sniper />} />
        <Route path="positions" element={<Positions />} />
        <Route path="copy" element={<Copy />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="plans" element={<Plans />} />
        <Route path="referrals" element={<Referrals />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="admin" element={<Admin />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider><App /></AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
