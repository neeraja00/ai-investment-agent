// client/src/components/Navbar.jsx
// Top navigation bar

import { useState, useEffect } from "react";
import { Activity, Sun, Moon, History } from "lucide-react";

export default function Navbar({ onLogoClick, onHistoryClick }) {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const saved = localStorage.getItem("ai_invest_theme") || "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("ai_invest_theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(8,12,20,0.85)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid var(--border)",
      padding: "0 24px",
    }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        {/* Logo */}
        <div
          onClick={onLogoClick}
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
        >
          <div style={{
            width: 34, height: 34,
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.1rem",
            boxShadow: "0 4px 14px rgba(59,130,246,0.4)",
          }}>
            <Activity size={20} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "0.95rem", lineHeight: 1.1 }}>AlphaAgent</div>
            <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
              AI INVESTMENT RESEARCH
            </div>
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            padding: "4px 12px",
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.25)",
            borderRadius: 100,
            fontSize: "0.72rem",
            color: "var(--invest-color)",
            fontWeight: 600,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "var(--invest-color)",
              animation: "pulse 2s infinite",
              display: "inline-block",
            }} />
            LIVE · Powered by Gemini
          </div>

          {/* History Button */}
          <button 
            onClick={onHistoryClick}
            className="btn btn-ghost"
            style={{ padding: "8px 16px", borderRadius: 100, fontSize: "0.85rem", gap: 6 }}
          >
            <History size={16} /> History
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="btn btn-ghost"
            style={{ padding: "8px", borderRadius: "50%" }}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
