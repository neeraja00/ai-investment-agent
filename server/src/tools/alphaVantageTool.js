// server/src/tools/alphaVantageTool.js
// Alpha Vantage — current price + historical data

const AV_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE = "https://www.alphavantage.co/query";

async function avGet(params) {
  if (!AV_KEY) return null;
  const url = new URL(BASE);
  url.searchParams.set("apikey", AV_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  try {
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data = await res.json();
    if (data["Error Message"] || data["Information"] || data["Note"]) return null;
    return data;
  } catch { return null; }
}

export async function getPriceData(ticker) {
  const [quoteData, dailyData] = await Promise.all([
    avGet({ function: "GLOBAL_QUOTE", symbol: ticker }),
    avGet({ function: "TIME_SERIES_DAILY", symbol: ticker, outputsize: "compact" }),
  ]);

  const q = quoteData?.["Global Quote"];
  const currentPrice = parseFloat(q?.["05. price"] || "0") || null;
  const change = parseFloat(q?.["09. change"] || "0") || null;
  const changePercent = parseFloat((q?.["10. change percent"] || "0%").replace("%", "")) || null;
  const volume = parseInt(q?.["06. volume"] || "0") || null;

  let high52Week = null, low52Week = null, avgVolume = null;

  if (dailyData?.["Time Series (Daily)"]) {
    const series = Object.values(dailyData["Time Series (Daily)"]).slice(0, 252);
    const highs = series.map(d => parseFloat(d["2. high"] || "0")).filter(Boolean);
    const lows  = series.map(d => parseFloat(d["3. low"]  || "0")).filter(Boolean);
    const vols  = series.map(d => parseFloat(d["5. volume"] || "0")).filter(Boolean);
    high52Week = highs.length ? Math.max(...highs) : null;
    low52Week  = lows.length  ? Math.min(...lows)  : null;
    avgVolume  = vols.length  ? Math.round(vols.reduce((a, b) => a + b, 0) / vols.length) : null;
  }

  if (!currentPrice && !high52Week) return null;

  return { currentPrice, change, changePercent, volume, avgVolume, high52Week, low52Week };
}
