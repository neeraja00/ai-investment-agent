// client/src/components/FundamentalsCard.jsx
// Financial fundamentals display card

function fmt(val, prefix = "", suffix = "", decimals = 2) {
  if (val === null || val === undefined) return "N/A";
  const n = parseFloat(val);
  if (isNaN(n)) return "N/A";
  return `${prefix}${n.toFixed(decimals)}${suffix}`;
}

function fmtBig(val) {
  if (val === null || val === undefined) return "N/A";
  const n = parseFloat(val);
  if (isNaN(n)) return "N/A";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toFixed(2)}`;
}

function colorVal(val, goodIfPositive = true) {
  if (val === null || val === undefined) return "var(--text-primary)";
  const n = parseFloat(val);
  if (isNaN(n)) return "var(--text-primary)";
  if (goodIfPositive) return n >= 0 ? "var(--invest-color)" : "var(--pass-color)";
  return n <= 1 ? "var(--invest-color)" : "var(--pass-color)";
}

import { BarChart2 } from "lucide-react";

export default function FundamentalsCard({ fundamentals, companyProfile }) {
  if (!fundamentals) {
    return (
      <div className="card" style={{ padding: "24px", height: "100%" }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <BarChart2 size={20} color="var(--invest-color)" /> Financial Fundamentals
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          Financial data unavailable — Finnhub API key not configured or company not listed on US exchanges.
        </p>
      </div>
    );
  }

  const mktCap = fundamentals.marketCap || companyProfile?.marketCap;

  const rows = [
    { label: "Market Cap",       value: fmtBig(mktCap), color: "var(--text-primary)" },
    { label: "P/E Ratio",        value: fmt(fundamentals.peRatio, "", "x"), color: "var(--text-primary)" },
    { label: "EPS (Annual)",     value: fmt(fundamentals.eps, "$"), color: colorVal(fundamentals.eps) },
    { label: "Revenue Growth",   value: fmt(fundamentals.revenueGrowth, "", "%"), color: colorVal(fundamentals.revenueGrowth) },
    { label: "Profit Margin",    value: fmt(fundamentals.profitMargin, "", "%"), color: colorVal(fundamentals.profitMargin) },
    { label: "ROE",              value: fmt(fundamentals.roe, "", "%"), color: colorVal(fundamentals.roe) },
    { label: "Debt / Equity",    value: fmt(fundamentals.debtToEquity, "", "x"), color: "var(--text-primary)" },
    { label: "Beta",             value: fmt(fundamentals.beta), color: "var(--text-primary)" },
    { label: "Dividend Yield",   value: fmt(fundamentals.dividendYield, "", "%"), color: "var(--text-primary)" },
  ];

  return (
    <div className="card" style={{ padding: "24px", height: "100%", display: "flex", flexDirection: "column" }}>
      <h3 style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <BarChart2 size={20} color="var(--invest-color)" /> Fundamentals
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 24, rowGap: 0, flex: 1, alignContent: "flex-start" }}>
        {rows.map(row => (
          <div key={row.label} className="data-row">
            <span className="data-label">{row.label}</span>
            <span className="data-value" style={{ color: row.color }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
