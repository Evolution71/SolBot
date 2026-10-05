import { LayoutGrid, LineChart, Bot, History, Trophy, Settings as SettingsIcon } from "lucide-react";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "trade", label: "Trade", icon: LineChart },
  { id: "autopilot", label: "Autopilot", icon: Bot },
  { id: "history", label: "History", icon: History },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

export default function DashboardNav({ active, onChange }) {
  return (
    <nav className="flex items-center gap-1 overflow-x-auto px-6 py-3 border-b border-nexus-line">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-medium transition-colors ${
              isActive ? "bg-nexus-accent/15 text-nexus-accent" : "text-nexus-muted hover:text-nexus-text"
            }`}
          >
            <Icon size={15} />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
