// client/src/App.jsx
// Main application — handles home page and results page in a single SPA

import { useState, useRef } from "react";
import Navbar from "./components/Navbar";
import AgentProgress from "./components/AgentProgress";
import DecisionCard from "./components/DecisionCard";
import FundamentalsCard from "./components/FundamentalsCard";
import PriceCard from "./components/PriceCard";
import SentimentCard from "./components/SentimentCard";
import ResearchReport from "./components/ResearchReport";
import ChartCard from "./components/ChartCard";
import NewsFeed from "./components/NewsFeed";
import PeersCard from "./components/PeersCard";
import HistoryPage from "./components/HistoryPage";
import { useResearch } from "./hooks/useResearch";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Globe, BarChart2, TrendingUp, Newspaper, Brain, Scale, XCircle, FlaskConical, ArrowLeft, History } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { useEffect } from "react";

const EXAMPLE_COMPANIES = [
  { name: "Apple", ticker: "AAPL", desc: "Consumer Tech Giant" },
  { name: "Nvidia", ticker: "NVDA", desc: "AI Chip Leader" },
  { name: "Tesla", ticker: "TSLA", desc: "EV & Energy" },
  { name: "Infosys", ticker: "INFY", desc: "India IT Services" },
  { name: "Microsoft", ticker: "MSFT", desc: "Cloud & AI" },
  { name: "Amazon", ticker: "AMZN", desc: "E-Commerce & Cloud" },
];

// ─── Ticker Scroll Bar ───────────────────────────────────────────────────────
function TickerBar() {
  const items = ["AAPL +1.2%", "NVDA +3.8%", "MSFT -0.4%", "TSLA +5.1%",
                 "AMZN +0.9%", "GOOG +1.7%", "META +2.3%", "INFY -0.6%",
                 "AAPL +1.2%", "NVDA +3.8%", "MSFT -0.4%", "TSLA +5.1%",
                 "AMZN +0.9%", "GOOG +1.7%", "META +2.3%", "INFY -0.6%"];
  return (
    <div className="ticker-wrap">
      <div className="ticker-inner">
        {items.map((item, i) => {
          const up = item.includes("+");
          return (
            <span key={i} style={{
              color: up ? "var(--invest-color)" : "var(--pass-color)",
              fontSize: "0.8rem",
              fontFamily: "JetBrains Mono, monospace",
              fontWeight: 500,
            }}>
              {item}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─── Home Page ───────────────────────────────────────────────────────────────
function HomePage({ onSearch, history }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) onSearch(input.trim());
  };

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      {/* Hero */}
      <div className="container" style={{ textAlign: "center", padding: "80px 24px 40px" }}>
        <div className="fade-up" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 16px",
          background: "rgba(59,130,246,0.1)",
          border: "1px solid rgba(59,130,246,0.25)",
          borderRadius: 100,
          fontSize: "0.78rem",
          color: "var(--accent-blue)",
          fontWeight: 600,
          marginBottom: 24,
          letterSpacing: "0.05em",
        }}>
          <span style={{ animation: "pulse 2s infinite", display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--accent-blue)" }} />
          POWERED BY LANGRAPH · GEMINI AI · REAL-TIME DATA
        </div>

        <h1 className="fade-up stagger-1" style={{ marginBottom: 16 }}>
          <span className="gradient-text">AI-Powered</span> Investment<br />Research Agent
        </h1>

        <p className="fade-up stagger-2" style={{
          color: "var(--text-secondary)",
          fontSize: "1.1rem",
          maxWidth: 560,
          margin: "0 auto 48px",
          lineHeight: 1.7,
        }}>
          Enter any company name. Our AI agent autonomously researches the web,
          analyses financials, gauges sentiment — and delivers a clear{" "}
          <strong style={{ color: "var(--text-primary)" }}>INVEST or PASS</strong> decision.
        </p>

        {/* Search form */}
        <form onSubmit={handleSubmit} className="fade-up stagger-3" style={{
          display: "flex",
          gap: 12,
          maxWidth: 600,
          margin: "0 auto 48px",
          flexWrap: "wrap",
        }}>
          <input
            className="input"
            style={{ flex: 1, minWidth: 240, fontSize: "1.05rem", padding: "18px 22px" }}
            placeholder="e.g. Apple, Nvidia, Infosys..."
            value={input}
            onChange={e => setInput(e.target.value)}
            autoFocus
          />
          <button
            className="btn btn-primary"
            type="submit"
            disabled={!input.trim()}
            style={{ padding: "18px 32px", fontSize: "1rem" }}
          >
            <Search size={20} /> Research
          </button>
        </form>

        {/* Example chips */}
        <div className="fade-up stagger-4" style={{
          display: "flex", flexWrap: "wrap", gap: 10,
          justifyContent: "center", maxWidth: 600, margin: "0 auto",
        }}>
          {EXAMPLE_COMPANIES.map(c => (
            <button
              key={c.ticker}
              className="btn btn-ghost"
              onClick={() => onSearch(c.name)}
              style={{ padding: "8px 16px", fontSize: "0.82rem", gap: 6 }}
            >
              <span>{c.ticker}</span>
              <span style={{ color: "var(--text-muted)" }}>·</span>
              <span style={{ color: "var(--text-muted)" }}>{c.desc}</span>
            </button>
          ))}
        </div>
        
        {/* Search History / Watchlist */}
        {history.filter(h => typeof h !== "string").length > 0 && (
          <div className="fade-up stagger-5" style={{ marginTop: 48, width: "100%", maxWidth: 800, margin: "48px auto 0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <History size={16} /> Your Watchlist
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              {history.map((item, i) => {
                if (typeof item === "string") return null;
                const isPos = item.change >= 0;
                const color = isPos ? "var(--invest-color)" : "var(--pass-color)";
                const chartData = item.sparkline?.map((val, idx) => ({ i: idx, val })) || [];
                
                return (
                  <div key={item.ticker + i} className="card" onClick={() => onSearch(item.name)} style={{ padding: 16, cursor: "pointer", display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{item.ticker}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 100 }}>{item.name}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 600 }}>${item.price?.toFixed(2) || "---"}</div>
                        <div style={{ fontSize: "0.85rem", color, fontWeight: 600 }}>{isPos ? "+" : ""}{item.change?.toFixed(2) || "0.00"}%</div>
                      </div>
                    </div>
                    {chartData.length > 0 && (
                      <div style={{ height: 40, width: "100%" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <Line type="monotone" dataKey="val" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <TickerBar />

      {/* Feature cards */}
      <div className="container" style={{ padding: "40px 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {[
            { icon: <Globe size={32} color="var(--accent-blue)" />, title: "Web Research", desc: "Searches 6+ sources with Tavily for real-time news, analysis and context." },
            { icon: <BarChart2 size={32} color="var(--invest-color)" />, title: "Fundamental Analysis", desc: "P/E, EPS, revenue growth, ROE and more via Finnhub financial data." },
            { icon: <TrendingUp size={32} color="var(--accent-purple)" />, title: "Price & Momentum", desc: "52-week range, daily change, volume via Alpha Vantage market data." },
            { icon: <Newspaper size={32} color="var(--accent-cyan)" />, title: "Sentiment Analysis", desc: "News & social media sentiment scoring from Finnhub's AI engine." },
            { icon: <Brain size={32} color="var(--neutral-color)" />, title: "AI Synthesis", desc: "Gemini 1.5 Flash synthesizes all research into a structured report." },
            { icon: <Scale size={32} color="var(--pass-color)" />, title: "Investment Decision", desc: "INVEST / PASS / NEUTRAL with confidence score, bull & bear cases." },
          ].map((f, i) => (
            <motion.div 
              key={i} 
              className={`card`} 
              style={{ padding: "24px" }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.1 * i, type: "spring", stiffness: 100 }}
              whileHover={{ y: -6, scale: 1.02 }}
            >
              <div style={{ marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ marginBottom: 8, fontSize: "1.05rem" }}>{f.title}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Results Page ─────────────────────────────────────────────────────────────
function ResultsPage({ companyName, status, steps, result, error, currentLabel, onReset }) {
  const isLoading = status === "loading" || status === "streaming";

  return (
    <div className="container" style={{ padding: "32px 24px 80px", position: "relative", zIndex: 1 }}>
      {/* Back button */}
      <button className="btn btn-ghost" onClick={onReset} style={{ marginBottom: 24, padding: "8px 16px", fontSize: "0.85rem" }}>
        <ArrowLeft size={16} /> New Research
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Error state */}
        {status === "error" && (
          <div className="card fade-up" style={{
            padding: "28px",
            borderColor: "rgba(239,68,68,0.4)",
            background: "rgba(239,68,68,0.06)",
            textAlign: "center",
          }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><XCircle size={48} color="var(--pass-color)" /></div>
            <h3 style={{ marginBottom: 8, color: "var(--pass-color)" }}>Research Failed</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 20 }}>{error}</p>
            <button className="btn btn-primary" onClick={onReset}>Try Again</button>
          </div>
        )}

        {/* Loading / streaming */}
        {isLoading && !result && (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: 24, alignItems: "stretch" }}>
            <div className="card fade-in" style={{ padding: "60px 40px", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}
              >
                <FlaskConical size={64} color="var(--accent-cyan)" />
              </motion.div>
              <h2 style={{ marginBottom: 8 }}>Researching <span className="gradient-text">{companyName}</span></h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Our AI agent is working. This typically takes 20–40 seconds.
              </p>
            </div>
            <div style={{ height: "100%" }}>
              {steps.length > 0 && <AgentProgress steps={steps} currentLabel={currentLabel} />}
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15 }
              }
            }}
            style={{ display: "flex", flexDirection: "column", gap: 24 }}
          >
            {/* Top Level: Company Header */}
            {result.companyProfile && (
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } } }} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8, background: "rgba(255,255,255,0.02)", padding: 20, borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
                {result.companyProfile.logo && (
                  <img src={result.companyProfile.logo} alt="logo" style={{ width: 56, height: 56, borderRadius: "50%", background: "#fff", padding: 4 }} />
                )}
                <div>
                  <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: 12, fontSize: "1.6rem" }}>
                    {result.companyProfile.name} <span style={{ fontSize: "0.9rem", padding: "4px 8px", background: "rgba(255,255,255,0.1)", borderRadius: 6, fontFamily: "JetBrains Mono" }}>{result.companyProfile.ticker}</span>
                  </h2>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: 6 }}>
                    {result.companyProfile.exchange} · {result.companyProfile.industry} · {result.companyProfile.country}
                  </div>
                </div>
                {result.companyProfile.website && (
                  <a href={result.companyProfile.website} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ marginLeft: "auto", padding: "8px 16px", fontSize: "0.9rem" }}>Visit Website</a>
                )}
              </motion.div>
            )}

            {/* Decision Level */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } } }}>
              <DecisionCard result={result} />
            </motion.div>

            {/* Data Cards Level: Grid of 4 */}
            <motion.div 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } } }}
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, alignItems: "stretch" }}
            >
              <PriceCard priceData={result.priceData} ticker={result.tickerSymbol} />
              <PeersCard peersData={result.peersData} />
              <SentimentCard sentiment={result.sentiment} />
              <FundamentalsCard fundamentals={result.fundamentals} companyProfile={result.companyProfile} />
            </motion.div>

            {/* Chart Level */}
            {result.historicalPrices && (
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } } }}>
                <ChartCard data={result.historicalPrices} ticker={result.tickerSymbol} />
              </motion.div>
            )}

            {/* News Feed */}
            {result.sentiment?.newsArticles && (
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } } }}>
                <NewsFeed newsArticles={result.sentiment.newsArticles} />
              </motion.div>
            )}

            {/* Report Level */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } } }}>
              <ResearchReport report={result.analysisReport} />
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home"); // home | results | history
  const [searchedCompany, setSearchedCompany] = useState("");
  const [history, setHistory] = useState([]);
  const { status, steps, result, error, currentLabel, research, reset, setResult } = useResearch();

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem("ai_invest_history");
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const handleSearch = (name) => {
    setSearchedCompany(name);
    setPage("results");
    research(name);
  };

  useEffect(() => {
    if (result && result.tickerSymbol && result.priceData && result.historicalPrices) {
      setHistory(prev => {
        const filtered = prev.filter(h => {
          const n = typeof h === "string" ? h : h.name;
          return n.toLowerCase() !== searchedCompany.toLowerCase();
        });
        
        const newItem = {
          name: searchedCompany,
          ticker: result.tickerSymbol,
          price: result.priceData.currentPrice,
          change: result.priceData.changePercent,
          sparkline: result.historicalPrices.slice(-15).map(d => d.close)
        };
        
        const newHistory = [newItem, ...filtered].slice(0, 6);
        localStorage.setItem("ai_invest_history", JSON.stringify(newHistory));
        return newHistory;
      });
    }
  }, [result]);

  const handleReset = () => {
    reset();
    setPage("home");
    setSearchedCompany("");
  };

  return (
    <>
      <div className="gradient-mesh" />
      <Navbar onLogoClick={handleReset} onHistoryClick={() => setPage("history")} />

      {page === "home" ? (
        <HomePage onSearch={handleSearch} history={history} />
      ) : page === "history" ? (
        <HistoryPage 
          onViewResult={(item) => { 
            setResult(item); 
            setSearchedCompany(item.companyName); 
            setPage("results"); 
          }} 
        />
      ) : (
        <ResultsPage
          companyName={searchedCompany}
          status={status}
          steps={steps}
          result={result}
          error={error}
          currentLabel={currentLabel}
          onReset={handleReset}
        />
      )}
    </>
  );
}
