import { useEffect, useRef } from "react";
import { Modal } from "./ui.jsx";

/* Draws a shareable P&L card on a canvas and lets the user download it as a PNG. */
export default function ShareCard({ symbol, pnlSol, pnlPct, username, paper, onClose }) {
  const ref = useRef(null);
  const win = pnlSol >= 0;

  useEffect(() => {
    const draw = () => {
      const c = ref.current;
      if (!c) return;
      const x = c.getContext("2d");
      const W = 1200, H = 630, acc = win ? "#b8ff3b" : "#ff5b77";
      x.fillStyle = "#06090a"; x.fillRect(0, 0, W, H);
      x.strokeStyle = "#141d1e"; x.lineWidth = 1;
      for (let i = 0; i < W; i += 60) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke(); }
      for (let i = 0; i < H; i += 60) { x.beginPath(); x.moveTo(0, i); x.lineTo(W, i); x.stroke(); }
      const g = x.createRadialGradient(950, 80, 0, 950, 80, 620);
      g.addColorStop(0, win ? "rgba(184,255,59,0.28)" : "rgba(255,91,119,0.28)"); g.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = g; x.fillRect(0, 0, W, H);

      x.strokeStyle = "#b8ff3b"; x.lineWidth = 5; x.lineCap = "round";
      x.beginPath(); x.arc(102, 100, 22, 0, Math.PI * 2); x.stroke();
      [[102, 62, 102, 78], [102, 122, 102, 138], [64, 100, 80, 100], [124, 100, 140, 100]].forEach(([a, b, d, e]) => { x.beginPath(); x.moveTo(a, b); x.lineTo(d, e); x.stroke(); });
      x.fillStyle = "#e9f1ec"; x.font = "800 36px Sora, sans-serif"; x.fillText("NEXUS SOL BOT", 160, 113);

      x.fillStyle = "#8a9a95"; x.font = "500 30px 'JetBrains Mono', monospace"; x.fillText(`$${symbol}${paper ? "  ·  PAPER TRADE" : ""}`, 70, 250);
      x.fillStyle = acc; x.font = "800 150px Sora, sans-serif";
      x.fillText(`${win ? "+" : ""}${pnlPct == null ? pnlSol.toFixed(3) : pnlPct.toFixed(1) + "%"}`, 64, 410);
      x.fillStyle = "#e9f1ec"; x.font = "700 44px 'JetBrains Mono', monospace";
      x.fillText(`${win ? "+" : ""}${pnlSol.toFixed(4)} SOL`, 70, 490);
      x.fillStyle = "#5b6a66"; x.font = "500 26px 'JetBrains Mono', monospace";
      x.fillText(`@${username}  ·  Traded on Nexus Sol Bot`, 70, 572);
    };
    (document.fonts?.ready ?? Promise.resolve()).then(draw);
  }, [symbol, pnlSol, pnlPct, username, paper, win]);

  const download = () => {
    const a = document.createElement("a");
    a.download = `nexus-${symbol}-pnl.png`;
    a.href = ref.current.toDataURL("image/png");
    a.click();
  };

  return (
    <Modal onClose={onClose} wide>
      <div className="panel-head"><h3>Share your trade</h3><button className="btn sm ghost" onClick={onClose}>Close</button></div>
      <div className="panel-body stack">
        <canvas ref={ref} width="1200" height="630" style={{ width: "100%", borderRadius: 12, border: "1px solid var(--line)" }} />
        <button className="btn primary block" onClick={download}>Download image</button>
      </div>
    </Modal>
  );
}
