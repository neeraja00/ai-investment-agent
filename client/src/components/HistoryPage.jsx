import { useState, useEffect } from "react";
import { History, ArrowRight, TrendingUp, TrendingDown, Clock, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function HistoryPage({ onViewResult }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
const res = await fetch("https://ai-investment-agent-7w75.onrender.com/api/history");
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(item => 
    item.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.tickerSymbol && item.tickerSymbol.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container" style={{ padding: "40px 24px", position: "relative", zIndex: 1, minHeight: "80vh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <h2 style={{ display: "flex", alignItems: "center", gap: 12, margin: 0 }}>
          <History size={28} color="var(--accent-blue)" /> Research History
        </h2>
        <div style={{ position: "relative", width: "100%", maxWidth: 300 }}>
          <Search size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input 
            type="text" 
            className="input" 
            placeholder="Search company..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 40, width: "100%" }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>Loading history...</div>
      ) : error ? (
        <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--pass-color)", borderColor: "rgba(239,68,68,0.2)" }}>
          {error}. Is the database connected?
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
          No research history found. Run your first analysis to see it here!
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {filteredHistory.map((item) => (
            <div 
              key={item.id || item._id || item.createdAt} 
              className="card fade-up"
              onClick={() => onViewResult(item)}
              style={{ padding: 20, cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s", display: "flex", flexDirection: "column", gap: 16 }}
              onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.15)"; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ margin: "0 0 4px", fontSize: "1.2rem" }}>{item.tickerSymbol || "N/A"}</h3>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 160 }}>
                    {item.companyName}
                  </div>
                </div>
                <div style={{ 
                  padding: "4px 10px", 
                  borderRadius: 6, 
                  fontSize: "0.75rem", 
                  fontWeight: 700,
                  background: item.decision === "INVEST" ? "rgba(16,185,129,0.15)" : item.decision === "PASS" ? "rgba(239,68,68,0.15)" : "rgba(168,162,158,0.15)",
                  color: item.decision === "INVEST" ? "var(--invest-color)" : item.decision === "PASS" ? "var(--pass-color)" : "var(--neutral-color)"
                }}>
                  {item.decision} {item.confidenceScore ? `(${item.confidenceScore}%)` : ""}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: "0.8rem" }}>
                  <Clock size={14} /> 
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </div>
                <div style={{ color: "var(--accent-blue)", display: "flex", alignItems: "center", gap: 4, fontSize: "0.85rem", fontWeight: 600 }}>
                  View Report <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
