// server/src/tools/finnhubTool.js
// Finnhub API — stock fundamentals, company profile, news sentiment

const FINNHUB_KEY = process.env.FINNHUB_API_KEY;
const BASE = "https://finnhub.io/api/v1";

async function get(endpoint, params = {}) {
  if (!FINNHUB_KEY) return null;
  const url = new URL(`${BASE}${endpoint}`);
  url.searchParams.set("token", FINNHUB_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  try {
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

export async function resolveTickerSymbol(companyName) {
  const data = await get("/search", { q: companyName });
  if (!data?.result?.length) return null;
  
  // Strictly avoid tickers with a dot (e.g. .NS) because Finnhub Free tier blocks them
  const common = data.result.find(r => r.type === "Common Stock" && !r.symbol.includes("."));
  if (common) return common.symbol;
  
  const noDot = data.result.find(r => !r.symbol.includes("."));
  if (noDot) return noDot.symbol;

  // If ALL results have a dot (e.g. INFY.NS), just return the prefix (INFY).
  // This prevents fake fallback companies from being generated.
  const firstIntl = data.result[0]?.symbol || "";
  if (firstIntl.includes(".")) {
      return firstIntl.split(".")[0];
  }

  return null;
}

export async function getPriceData(ticker) {
  const q = await get("/quote", { symbol: ticker });
  if (!q || q.error) return null;
  return {
    currentPrice: q.c,
    change: q.d,
    changePercent: q.dp,
    high52Week: null,
    low52Week: null,
    volume: null,
    avgVolume: null
  };
}

export async function getCompanyProfile(ticker) {
  const d = await get("/stock/profile2", { symbol: ticker });
  if (!d?.name) return null;
  return {
    name: d.name,
    ticker: d.ticker || ticker,
    exchange: d.exchange || "N/A",
    sector: d.finnhubIndustry || "N/A",
    industry: d.finnhubIndustry || "N/A",
    country: d.country || "N/A",
    description: d.description || "",
    employees: d.employeeTotal || null,
    website: d.weburl || "",
    logo: d.logo || "",
    ipo: d.ipo || null,
    marketCap: d.marketCapitalization || null,
  };
}

export async function getFundamentals(ticker) {
  const data = await get("/stock/metric", { symbol: ticker, metric: "all" });
  if (!data?.metric) return null;
  const m = data.metric;
  return {
    peRatio: m.peTTM ?? m.peBasicExclExtraTTM ?? m.peNormalizedAnnual ?? null,
    eps: m.epsTTM ?? m.epsBasicExclExtraItemsTTM ?? m.epsAnnual ?? null,
    revenueGrowth: m.revenueGrowthTTMYoy ?? m.revenueGrowth5Y ?? null,
    profitMargin: m.netProfitMarginTTM ?? m.netProfitMarginAnnual ?? null,
    debtToEquity: m["totalDebt/totalEquityQuarterly"] ?? m["totalDebt/totalEquityAnnual"] ?? null,
    roe: m.roeTTM ?? m.roeRfy ?? null,
    marketCap: m.marketCapitalization ?? null,
    beta: m.beta ?? null,
    dividendYield: m.dividendYieldIndicatedAnnual ?? m.currentDividendYieldTTM ?? null,
    revenuePerShare: m.revenuePerShareTTM ?? m.revenuePerShareAnnual ?? null,
    currentRatio: m.currentRatioQuarterly ?? m.currentRatioAnnual ?? null,
  };
}

export async function getSentiment(ticker) {
  if (!ticker) return null;
  const from = new Date(Date.now() - 7 * 864e5).toISOString().split("T")[0];
  const to   = new Date().toISOString().split("T")[0];

  const newsData = await get("/company-news", { symbol: ticker, from, to });
  const newsArticles = (newsData || []).slice(0, 10).map(n => ({
    headline: n.headline,
    url: n.url,
    image: n.image,
    summary: n.summary,
    datetime: n.datetime
  }));

  let bullishPoints = 0;
  let bearishPoints = 0;
  
  const positiveWords = ["surge", "soar", "jump", "record", "beat", "buy", "upgrade", "growth", "high", "win", "bull", "strong", "up", "deal", "profit", "gain"];
  const negativeWords = ["fall", "drop", "plunge", "miss", "sell", "downgrade", "shrink", "low", "lose", "bear", "weak", "down", "lawsuit", "penalty", "risk", "debt"];

  newsArticles.forEach(a => {
    const text = (a.headline + " " + a.summary).toLowerCase();
    let posMatch = 0;
    let negMatch = 0;
    positiveWords.forEach(w => { if (text.includes(w)) posMatch++; });
    negativeWords.forEach(w => { if (text.includes(w)) negMatch++; });

    if (posMatch > negMatch) bullishPoints++;
    else if (negMatch > posMatch) bearishPoints++;
  });

  const totalPoints = bullishPoints + bearishPoints;
  let bullish = 50, bearish = 50;
  if (totalPoints > 0) {
    bullish = Math.round((bullishPoints / totalPoints) * 100);
    bearish = 100 - bullish;
  }

  const score = parseFloat(((bullish - bearish) / 100).toFixed(3));
  const label = score > 0.1 ? "Bullish" : score < -0.1 ? "Bearish" : "Neutral";

  return {
    score,
    label,
    bullishPercent: bullish,
    bearishPercent: bearish,
    newsCount: newsArticles.length,
    headlines: newsArticles.map(a => a.headline),
    newsArticles,
  };
}

export async function getHistoricalPrices(ticker, days = 30) {
  if (!ticker) return [];
  const range = days > 300 ? "1y" : "1mo";
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=${range}`;
  
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return [];
    const data = await res.json();
    const result = data.chart?.result?.[0];
    if (!result) return [];
    
    const timestamps = result.timestamp || [];
    const quote = result.indicators?.quote?.[0] || {};
    
    return timestamps.map((t, i) => ({
      date: new Date(t * 1000).toISOString().split('T')[0],
      open: quote.open?.[i],
      high: quote.high?.[i],
      low: quote.low?.[i],
      close: quote.close?.[i],
      volume: quote.volume?.[i] || 0
    })).filter(d => d.close != null);
  } catch (e) {
    console.error("[getHistoricalPrices] Yahoo Finance fetch failed", e);
    return [];
  }
}

export async function getPeersAndQuotes(ticker) {
  if (!ticker) return [];
  const peers = await get("/stock/peers", { symbol: ticker });
  if (!peers || !Array.isArray(peers)) return [];
  
  const topPeers = peers.filter(p => p !== ticker).slice(0, 3);
  
  const peerData = await Promise.all(topPeers.map(async (peerSymbol) => {
    const q = await get("/quote", { symbol: peerSymbol });
    if (!q) return null;
    return {
      symbol: peerSymbol,
      currentPrice: q.c,
      changePercent: q.dp
    };
  }));
  
  return peerData.filter(Boolean);
}
