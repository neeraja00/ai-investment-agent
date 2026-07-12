// client/src/components/DecisionCard.jsx
// The hero decision card — INVEST / PASS / NEUTRAL with score ring

import ScoreRing from "./ScoreRing";
import { CheckCircle2, XCircle, MinusCircle, Lightbulb, Factory, Globe2, Clock, Brain, TrendingUp, TrendingDown, CheckSquare, AlertTriangle } from "lucide-react";

const DECISION_CONFIG = {
  INVEST: {
    icon: <CheckCircle2 size={48} strokeWidth={2.5} />,
    label: "INVEST",
    tagline: "Strong Buy Recommendation",
    className: "decision-invest",
    color: "var(--invest-color)",
    bg: "var(--invest-bg)",
  },
  PASS: {
    icon: <XCircle size={48} strokeWidth={2.5} />,
    label: "PASS",
    tagline: "Not Recommended at This Time",
    className: "decision-pass",
    color: "var(--pass-color)",
    bg: "var(--pass-bg)",
  },
  NEUTRAL: {
    icon: <MinusCircle size={48} strokeWidth={2.5} />,
    label: "HOLD / WATCH",
    tagline: "Monitor Before Committing",
    className: "decision-neutral",
    color: "var(--neutral-color)",
    bg: "var(--neutral-bg)",
  },
};

export default function DecisionCard({ result }) {
  const { decision, confidenceScore, reasoning, recommendation,
          keyStrengths, keyRisks, bullCase, bearCase, companyProfile,
          tickerSymbol, researchTime } = result;

  const cfg = DECISION_CONFIG[decision] || DECISION_CONFIG.NEUTRAL;

  return (
    <div className={`card fade-up ${cfg.className}`} style={{ padding: "32px", marginBottom: 24 }}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24 }}>
        {/* Company + Decision */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            {companyProfile?.logo && (
              <img src={companyProfile.logo} alt="logo"
                style={{ width: 36, height: 36, borderRadius: 8, objectFit: "contain", background: "#fff", padding: 4 }} />
            )}
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500, letterSpacing: "0.06em" }}>
                {tickerSymbol} · {companyProfile?.exchange || ""}
              </div>
              <h2 style={{ lineHeight: 1.2 }}>{companyProfile?.name || result.companyName}</h2>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0 12px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              fontSize: "3.5rem",
              fontWeight: 900,
              color: cfg.color,
              letterSpacing: "-0.02em",
              textShadow: `0 0 30px ${cfg.color}66`,
            }}>
              {cfg.icon} {cfg.label}
            </div>
          </div>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: 16 }}>
            {cfg.tagline}
          </div>

          {/* Recommendation */}
          <div style={{
            background: cfg.bg,
            border: `1px solid ${cfg.color}44`,
            borderRadius: "var(--radius-md)",
            padding: "14px 18px",
            color: cfg.color,
            fontWeight: 500,
            fontSize: "0.9rem",
            marginBottom: 16,
            display: "flex", gap: 10, alignItems: "flex-start"
          }}>
            <Lightbulb size={20} style={{ flexShrink: 0 }} /> {recommendation}
          </div>

          {/* Meta */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
              <Factory size={14} /> {companyProfile?.sector}
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
              <Globe2 size={14} /> {companyProfile?.country}
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
              <Clock size={14} /> Analyzed in {researchTime ? `${(researchTime / 1000).toFixed(1)}s` : "—"}
            </span>
          </div>
        </div>

        {/* Score Ring */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <ScoreRing score={confidenceScore || 50} decision={decision} size={150} />
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center" }}>
            AI Confidence
          </div>
        </div>
      </div>

      {/* Reasoning */}
      <div style={{
        marginTop: 24,
        padding: "16px 20px",
        background: "rgba(255,255,255,0.03)",
        borderRadius: "var(--radius-md)",
        borderLeft: `3px solid ${cfg.color}`,
        color: "var(--text-secondary)",
        fontSize: "0.9rem",
        lineHeight: 1.7,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
          <Brain size={18} color="var(--accent-blue)" /> Reasoning
        </div>
        {reasoning}
      </div>

      {/* Bull / Bear */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
        <div style={{
          padding: "16px",
          background: "rgba(16,185,129,0.06)",
          border: "1px solid rgba(16,185,129,0.2)",
          borderRadius: "var(--radius-md)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, color: "var(--invest-color)", marginBottom: 8, fontSize: "0.85rem" }}>
            <TrendingUp size={16} /> BULL CASE
          </div>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.6 }}>
            {bullCase}
          </div>
        </div>
        <div style={{
          padding: "16px",
          background: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: "var(--radius-md)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, color: "var(--pass-color)", marginBottom: 8, fontSize: "0.85rem" }}>
            <TrendingDown size={16} /> BEAR CASE
          </div>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.6 }}>
            {bearCase}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10, fontSize: "0.8rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            <CheckSquare size={14} /> Key Strengths
          </div>
          {(keyStrengths || []).map((s, i) => (
            <div key={i} style={{
              padding: "10px 14px",
              marginBottom: 8,
              background: "rgba(16,185,129,0.06)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              borderLeft: "2px solid var(--invest-color)",
            }}>
              {s}
            </div>
          ))}
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10, fontSize: "0.8rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            <AlertTriangle size={14} /> Key Risks
          </div>
          {(keyRisks || []).map((r, i) => (
            <div key={i} style={{
              padding: "8px 12px",
              marginBottom: 6,
              background: "rgba(239,68,68,0.06)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.83rem",
              color: "var(--text-secondary)",
              borderLeft: "2px solid var(--pass-color)",
            }}>
              {r}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
