import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Info } from "lucide-react";

const listeners = new Set();
let idCounter = 0;

export function toast(message, type = "info") {
  const id = ++idCounter;
  listeners.forEach((fn) => fn({ id, message, type }));
}

const ICONS = { success: CheckCircle2, error: XCircle, info: Info };
const COLORS = {
  success: "border-nexus-accent/40 text-nexus-accent",
  error: "border-nexus-warn/40 text-nexus-warn",
  info: "border-nexus-accent2/40 text-nexus-accent2",
};

export default function ToastHost() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    function handle(item) {
      setItems((prev) => [...prev, item]);
      setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
      }, 3200);
    }
    listeners.add(handle);
    return () => listeners.delete(handle);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-xs">
      {items.map((item) => {
        const Icon = ICONS[item.type] ?? Info;
        return (
          <div
            key={item.id}
            className={`flex items-center gap-2 rounded-lg border bg-nexus-panel px-4 py-3 text-xs shadow-lg animate-[fadeIn_0.15s_ease-out] ${COLORS[item.type]}`}
          >
            <Icon size={15} className="shrink-0" />
            <span className="text-nexus-text">{item.message}</span>
          </div>
        );
      })}
    </div>
  );
}
