// client/src/components/PriceCard.jsx
// Price & market data card

function fmt(val, prefix = "", suffix = "", decimals = 2) {
  if (val === null || val === undefined) return "N/A";
  const n = parseFloat(val);
  if (isNaN(n)) return "N/A";
  return `${prefix}${n.toFixed(decimals)}${suffix}`;
}

function fmtVol(val) {
  if (!val) return "N/A";
  if (val >= 1e9) return `${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `${(val / 1e6).toFixed(2)}M`;
  if (val >= 1e3) return `${(val / 1e3).toFixed(2)}K`;
  return String(val);
}

import { TrendingUp } from "lucide-react";

export default function PriceCard({ priceData, ticker }) {
  if (!priceData) {
    return (
      <div className="card" style={{ padding: "24px", height: "100%", display: "flex", flexDirection: "column" }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <TrendingUp size={20} color="var(--accent-purple)" /> Market & Price Data
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          Price data unavailable — Alpha Vantage API key not configured or company not US-listed.
        </p>
      </div>
    );
  }

  const changePositive = (priceData.change || 0) >= 0;

  // 52-week position (0-100%)
  const range = (priceData.high52Week || 0) - (priceData.low52Week || 0);
  const position = range > 0
    ? Math.round(((priceData.currentPrice || 0) - (priceData.low52Week || 0)) / range * 100)
    : null;

  return (
    <div className="card" style={{ padding: "24px", height: "100%", display: "flex", flexDirection: "column" }}>
      <h3 style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <TrendingUp size={20} color="var(--accent-purple)" /> Market & Price Data
      </h3>

      {/* Current price hero */}
      <div style={{ marginBottom: 20, padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-md)" }}>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 4 }}>
          {ticker} · Current Price
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <div style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "JetBrains Mono, monospace" }}>
            ${fmt(priceData.currentPrice, "", "", 2)}
          </div>
          <div style={{ color: changePositive ? "var(--invest-color)" : "var(--pass-color)", fontWeight: 600, fontSize: "0.9rem" }}>
            {changePositive ? "▲" : "▼"} {fmt(Math.abs(priceData.change || 0), "$")}
            ({fmt(Math.abs(priceData.changePercent || 0), "", "%")})
          </div>
        </div>
      </div>

      {/* 52-week range bar */}
      {priceData.high52Week && priceData.low52Week && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "0.75rem", color: "var(--text-muted)" }}>
            <span>52W Low: ${fmt(priceData.low52Week, "", "", 2)}</span>
            <span>52W High: ${fmt(priceData.high52Week, "", "", 2)}</span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, position: "relative" }}>
            {position !== null && (
              <div style={{
                position: "absolute",
                left: `${Math.max(2, Math.min(98, position))}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: 12, height: 12,
                borderRadius: "50%",
                background: "var(--accent-blue)",
                boxShadow: "0 0 8px var(--accent-blue)",
                border: "2px solid var(--bg-primary)",
              }} />
            )}
            <div style={{
              width: `${Math.max(2, Math.min(100, position || 50))}%`,
              height: "100%",
              background: "linear-gradient(90deg, var(--pass-color), var(--neutral-color), var(--invest-color))",
              borderRadius: 3,
              opacity: 0.5,
            }} />
          </div>
          {position !== null && (
            <div style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>
              At {position}% of 52-week range
            </div>
          )}
        </div>
      )}

      <div className="data-row">
        <span className="data-label">Volume (Today)</span>
        <span className="data-value">{fmtVol(priceData.volume)}</span>
      </div>
      <div className="data-row">
        <span className="data-label">Avg Volume</span>
        <span className="data-value">{fmtVol(priceData.avgVolume)}</span>
      </div>
    </div>
  );
}
