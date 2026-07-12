import { Newspaper } from "lucide-react";

// Custom ESM-compatible Gauge Chart to prevent Vite/CommonJS crashes
const CustomGauge = ({ percent, label, badgeColor }) => {
  const rotation = percent * 180 - 90; // -90 to +90
  
  return (
    <div style={{ position: "relative", width: 220, height: 110, overflow: "hidden", margin: "20px auto 10px" }}>
      {/* Background Arc */}
      <div style={{ position: "absolute", top: 0, left: 0, width: 220, height: 220, borderRadius: "50%", border: "24px solid rgba(255,255,255,0.05)", boxSizing: "border-box" }} />
      
      {/* Color Arc */}
      <div style={{ 
        position: "absolute", top: 0, left: 0, width: 220, height: 220, borderRadius: "50%", 
        border: "24px solid transparent", 
        borderTopColor: badgeColor, borderRightColor: badgeColor,
        boxSizing: "border-box", 
        transform: `rotate(${Math.max(rotation - 90, -180)}deg)`, // Fill arc based on percent
        transformOrigin: "50% 50%",
        transition: "transform 1s cubic-bezier(0.4, 0, 0.2, 1)"
      }} />
      
      {/* Needle */}
      <div style={{ 
        position: "absolute", bottom: 0, left: "50%", width: 4, height: 90, 
        background: "var(--text-secondary)", transformOrigin: "bottom center", 
        transform: `translateX(-50%) rotate(${rotation}deg)`, 
        transition: "transform 1s cubic-bezier(0.4, 0, 0.2, 1)", borderRadius: 2 
      }} />
      
      {/* Center dot */}
      <div style={{ position: "absolute", bottom: -8, left: "50%", width: 16, height: 16, borderRadius: "50%", background: "var(--text-primary)", transform: "translateX(-50%)" }} />
      
      {/* Label */}
      <div style={{ position: "absolute", bottom: 16, left: 0, width: "100%", textAlign: "center", fontSize: "1.1rem", fontWeight: 700, color: badgeColor, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
        {label}
      </div>
    </div>
  );
};

export default function SentimentCard({ sentiment }) {
  if (!sentiment) {
    return (
      <div className="card" style={{ padding: "24px", height: "100%", display: "flex", flexDirection: "column" }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Newspaper size={20} color="var(--accent-cyan)" /> News Sentiment
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          Sentiment data unavailable — Finnhub API key missing or no recent news.
        </p>
      </div>
    );
  }

  // Map score from [-1, 1] to [0, 1]
  const gaugePercent = (sentiment.score + 1) / 2;
  const badgeColor = sentiment.label === "Bullish" ? "var(--invest-color)"
                   : sentiment.label === "Bearish" ? "var(--pass-color)"
                   : "var(--neutral-color)";

  return (
    <div className="card" style={{ padding: "24px", height: "100%", display: "flex", flexDirection: "column" }}>
      <h3 style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Newspaper size={20} color="var(--accent-cyan)" /> News Sentiment
      </h3>
      
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <CustomGauge percent={gaugePercent} label={sentiment.label} badgeColor={badgeColor} />
        
        <div style={{ display: "flex", gap: 32, marginTop: 16 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "var(--invest-color)", fontWeight: 700, fontSize: "1.2rem" }}>{sentiment.bullishPercent}%</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Bullish News</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "var(--pass-color)", fontWeight: 700, fontSize: "1.2rem" }}>{sentiment.bearishPercent}%</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Bearish News</div>
          </div>
        </div>
      </div>
    </div>
  );
}
