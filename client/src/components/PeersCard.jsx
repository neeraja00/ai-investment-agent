import { Users } from "lucide-react";

export default function PeersCard({ peersData }) {
  if (!peersData || peersData.length === 0) return null;

  return (
    <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column" }}>
      <h3 style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Users size={20} color="var(--accent-blue)" /> Competitor Overview
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, justifyContent: "center" }}>
        {peersData.map(peer => {
          const isPos = peer.changePercent >= 0;
          return (
            <div key={peer.symbol} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-md)" }}>
              <span style={{ fontWeight: 600, fontSize: "1.1rem" }}>{peer.symbol}</span>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "1.05rem", fontWeight: 700 }}>${peer.currentPrice?.toFixed(2) || "---"}</div>
                <div style={{ fontSize: "0.85rem", color: isPos ? "var(--invest-color)" : "var(--pass-color)", fontWeight: 600 }}>
                  {isPos ? "+" : ""}{peer.changePercent?.toFixed(2) || "0.00"}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
