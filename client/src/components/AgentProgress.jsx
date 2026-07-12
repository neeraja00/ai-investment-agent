// client/src/components/AgentProgress.jsx
// Live step-by-step progress tracker during research

import { Search, Globe, BarChart2, TrendingUp, Newspaper, Brain, Scale, Check } from "lucide-react";

const STEP_META = {
  company_resolver: { icon: <Search size={18} />, label: "Resolving company" },
  web_research:     { icon: <Globe size={18} />, label: "Web research" },
  fundamentals:     { icon: <BarChart2 size={18} />, label: "Financial fundamentals" },
  price_data:       { icon: <TrendingUp size={18} />, label: "Price & market data" },
  sentiment:        { icon: <Newspaper size={18} />, label: "News sentiment" },
  synthesis:        { icon: <Brain size={18} />, label: "AI synthesis" },
  decision:         { icon: <Scale size={18} />,  label: "Investment decision" },
};

export default function AgentProgress({ steps, currentLabel }) {
  // Show all known steps, overlay live status
  const allSteps = Object.entries(STEP_META).map(([id, meta]) => {
    const live = steps.find(s => s.id === id);
    return {
      id,
      icon: meta.icon,
      label: live?.label || meta.label,
      status: live?.status || "pending",
    };
  });

  return (
    <div className="card" style={{ padding: "24px", height: "100%" }}>
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
        <div className="spinner" />
        <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{currentLabel}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {allSteps.map((step) => (
          <div key={step.id} className={`step-item step-${step.status}`}>
            <div className="step-dot" />
            <span style={{ display: "flex", alignItems: "center", color: step.status === "running" ? "var(--accent-cyan)" : "var(--text-secondary)", transition: "color 0.3s" }}>{step.icon}</span>
            <span style={{
              fontSize: "0.875rem",
              color: step.status === "complete" ? "var(--text-primary)"
                   : step.status === "running"  ? "var(--accent-cyan)"
                   : step.status === "error"    ? "var(--accent-red)"
                   : "var(--text-muted)",
              fontWeight: step.status === "running" ? 600 : 400,
              transition: "color 0.3s",
            }}>
              {step.label}
            </span>
            {step.status === "complete" && (
              <span style={{ marginLeft: "auto", color: "var(--accent-green)", display: "flex", alignItems: "center" }}><Check size={16} /></span>
            )}
            {step.status === "running" && (
              <span style={{ marginLeft: "auto" }}>
                <div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
