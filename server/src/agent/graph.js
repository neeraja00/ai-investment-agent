// server/src/agent/graph.js
// Pure JS workflow — the core AI investment research agent
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tavilySearch } from "../tools/tavilySearch.js";
import {
  resolveTickerSymbol,
  getCompanyProfile,
  getFundamentals,
  getSentiment,
  getHistoricalPrices,
  getPeersAndQuotes,
  getPriceData,
} from "../tools/finnhubTool.js";

// ─── LLM Setup (lazy — created on first use, not at module import time) ────────
let _llms = null;
function getLLMs() {
  if (!_llms) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const config = { temperature: 0.3, maxOutputTokens: 4096, maxRetries: 0 };
    // Define a fallback chain of models
    _llms = [
      new ChatGoogleGenerativeAI({ model: "gemini-2.0-flash", apiKey, ...config }),
      new ChatGoogleGenerativeAI({ model: "gemini-1.5-flash", apiKey, ...config }),
      new ChatGoogleGenerativeAI({ model: "gemini-1.5-pro", apiKey, ...config }),
      new ChatGoogleGenerativeAI({ model: "gemini-1.5-flash-8b", apiKey, ...config }),
    ];
  }
  return _llms;
}

// ─── Safe LLM invoke — retries on empty/failed responses and falls back to other models
async function safeLLM(messages, retriesPerModel = 3) {
  const llms = getLLMs();
  
  for (let m = 0; m < llms.length; m++) {
    const currentLLM = llms[m];
    
    for (let i = 0; i < retriesPerModel; i++) {
      try {
        const res = await currentLLM.invoke(messages);
        const text = res?.content?.toString?.()?.trim() ?? "";
        if (text.length > 0) return text;
        
        console.warn(`[LLM Model ${m}] Empty response (attempt ${i + 1}/${retriesPerModel}), retrying...`);
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      } catch (err) {
        const errMsg = err.message || "";
        console.warn(`[LLM Model ${m}] Error: ${errMsg}`);
        
        // Fatal API key errors — abort immediately, do NOT retry
        if (errMsg.includes("API key not valid") || errMsg.includes("400") || errMsg.includes("API_KEY_INVALID") || errMsg.includes("403")) {
           console.error("[LLM] Fatal API Key error. Aborting all LLM calls to save time.");
           return null; 
        }

        if (errMsg.includes("404")) {
           console.warn(`[LLM Model ${m}] Model not found. Switching to fallback model immediately.`);
           break; 
        }

        // Quota/Rate Limit (429) — Return null to trigger instant fallback and avoid blocking the UI!
        if (errMsg.includes("429") || errMsg.includes("Quota")) {
           console.warn(`[LLM Model ${m}] Quota exceeded. Returning null to trigger instant dynamic fallback...`);
           return null;
        }

        // If it's the last model and last retry, return null to trigger graceful fallbacks
        if (i === retriesPerModel - 1 && m === llms.length - 1) {
          console.error(`[LLM] All models failed. Last error: ${errMsg}`);
          return null; 
        }
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
  }
  return null;
}

// ─── Default Agent State ───────────────────────────────────────────────────────
const AgentState = {
  companyName: null,
  tickerSymbol: null,
  companyProfile: null,
  webResearch: null,
  fundamentals: null,
  priceData: null,
  historicalPrices: null,
  peersData: null,
  sentiment: null,
  analysisReport: null,
  decision: null,
  confidenceScore: null,
  keyStrengths: null,
  keyRisks: null,
  bullCase: null,
  bearCase: null,
  reasoning: null,
  recommendation: null,
  currentStep: null,
  completedSteps: [],
  error: null,
};

// ─── Node 1: Company Resolver ─────────────────────────────────────────────────
async function companyResolverNode(state, config) {
  config?.writer?.("step_start", { step: "company_resolver", label: "🔍 Resolving company info..." });

  const { companyName } = state;

  // 1. Try Finnhub symbol search
  let ticker = await resolveTickerSymbol(companyName);

  // 2. Fallback — ask LLM
  if (!ticker) {
    const raw = await safeLLM([{
      role: "user",
      content: `What is the US stock ticker symbol for "${companyName}"? Reply ONLY with the ticker (e.g. AAPL). If not a US-listed company, reply UNKNOWN.`,
    }]);
    if (raw) {
      const clean = raw.trim().toUpperCase().replace(/[^A-Z]/g, "");
      if (clean !== "UNKNOWN" && clean.length >= 1 && clean.length <= 6) ticker = clean;
    }
  }

  if (!ticker) {
    console.warn("[CompanyResolver] LLM fallback failed, using Tavily search for ticker");
    const searchRes = await tavilySearch(`${companyName} stock ticker symbol US NYSE NASDAQ`);
    const matches = searchRes.match(/\b([A-Z]{1,5})\b/g);
    if (matches && matches.length > 0) {
        const ignores = ["NYSE", "NASDAQ", "INC", "CORP", "LTD", "THE", "AND", "LLC"];
        const valid = matches.filter(m => !ignores.includes(m));
        if (valid.length > 0) ticker = valid[0];
    }
  }
  
  // If we absolutely cannot find a ticker, we leave it as null.
  // The downstream nodes will gracefully return "Data unavailable".
  
  // 3. Get company profile from Finnhub
  let companyProfile = ticker ? await getCompanyProfile(ticker) : null;

  // 4. If Finnhub has no profile, build one from web search + LLM
  if (!companyProfile) {
    const webInfo = await tavilySearch(
      `${companyName} company overview sector industry country stock exchange`,
      "general"
    );

    const raw = await safeLLM([{
      role: "user",
      content: `Extract a company profile from this info about "${companyName}". Return ONLY valid JSON, no markdown fences:
{"name":"...","ticker":"${ticker}","exchange":"...","sector":"...","industry":"...","country":"...","description":"...","employees":null,"website":"...","logo":""}

Info: ${webInfo.slice(0, 1200)}`,
    }]);

    if (raw) {
      try {
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) companyProfile = JSON.parse(match[0]);
      } catch { /* ignore */ }
    }
  }

  companyProfile = companyProfile || {
    name: companyName, ticker, exchange: "Unknown", sector: "Unknown",
    industry: "Unknown", country: "Unknown", description: "",
    employees: null, website: "", logo: "",
  };

  config?.writer?.("step_complete", {
    step: "company_resolver",
    label: `✅ Found: ${companyProfile.name} (${ticker})`,
  });

  return {
    tickerSymbol: ticker,
    companyProfile,
    currentStep: "company_resolver",
    completedSteps: [...(state.completedSteps || []), "company_resolver"],
  };
}

// ─── Node 2: Web Research ─────────────────────────────────────────────────────
async function webResearchNode(state, config) {
  config?.writer?.("step_start", { step: "web_research", label: "🌐 Searching web for news & analysis..." });

  const { companyName, tickerSymbol } = state;
  const queries = [
    `${companyName} latest news 2025 business performance earnings`,
    `${companyName} ${tickerSymbol} investment analysis risks growth strategy`,
    `${companyName} competitors market position valuation`,
  ];

  const results = await Promise.all(queries.map(q => tavilySearch(q, "finance")));
  const webResearch = results.join("\n\n---\n\n");

  config?.writer?.("step_complete", { step: "web_research", label: "✅ Web research complete" });

  return {
    webResearch,
    completedSteps: [...(state.completedSteps || []), "web_research"],
  };
}

// ─── Node 3: Fundamentals ─────────────────────────────────────────────────────
async function fundamentalsNode(state, config) {
  config?.writer?.("step_start", { step: "fundamentals", label: "📊 Fetching financial fundamentals..." });

  const fundamentals = await getFundamentals(state.tickerSymbol);

  config?.writer?.("step_complete", { step: "fundamentals", label: "✅ Fundamentals loaded" });

  return {
    fundamentals: fundamentals || null,
    completedSteps: [...(state.completedSteps || []), "fundamentals"],
  };
}

// ─── Node 4: Price Data ───────────────────────────────────────────────────────
async function priceDataNode(state, config) {
  config?.writer?.("step_start", { step: "price_data", label: "💹 Fetching price & market data..." });

  const [priceData, historicalPrices, historical1Year, peersData] = await Promise.all([
    getPriceData(state.tickerSymbol),
    getHistoricalPrices(state.tickerSymbol, 30),
    getHistoricalPrices(state.tickerSymbol, 365),
    getPeersAndQuotes(state.tickerSymbol)
  ]);

  if (priceData && historical1Year && historical1Year.length > 0) {
    const today = historical1Year[historical1Year.length - 1];
    priceData.volume = today.volume;
    
    const totalVolume = historical1Year.reduce((sum, day) => sum + day.volume, 0);
    priceData.avgVolume = Math.round(totalVolume / historical1Year.length);

    const highs = historical1Year.map(d => d.high);
    const lows = historical1Year.map(d => d.low);
    priceData.high52Week = Math.max(...highs);
    priceData.low52Week = Math.min(...lows);
  }

  config?.writer?.("step_complete", { step: "price_data", label: "✅ Price data loaded" });

  return {
    priceData: priceData || null,
    historicalPrices: historicalPrices || null,
    peersData: peersData || null,
    completedSteps: [...(state.completedSteps || []), "price_data"],
  };
}

// ─── Node 5: Sentiment ────────────────────────────────────────────────────────
async function sentimentNode(state, config) {
  config?.writer?.("step_start", { step: "sentiment", label: "📰 Analyzing news sentiment..." });

  const sentiment = await getSentiment(state.tickerSymbol);

  config?.writer?.("step_complete", { step: "sentiment", label: "✅ Sentiment analyzed" });

  return {
    sentiment: sentiment || null,
    completedSteps: [...(state.completedSteps || []), "sentiment"],
  };
}

// ─── Node 6: Synthesis ────────────────────────────────────────────────────────
async function synthesisNode(state, config) {
  config?.writer?.("step_start", { step: "synthesis", label: "🧠 Synthesizing research into report..." });

  const { companyName, companyProfile, fundamentals, priceData, sentiment, webResearch } = state;

  const financialStr = fundamentals
    ? `P/E: ${fundamentals.peRatio ?? "N/A"} | EPS: ${fundamentals.eps ?? "N/A"} | Revenue Growth: ${fundamentals.revenueGrowth ?? "N/A"}% | Profit Margin: ${fundamentals.profitMargin ?? "N/A"}% | ROE: ${fundamentals.roe ?? "N/A"}% | Debt/Equity: ${fundamentals.debtToEquity ?? "N/A"} | Market Cap: ${fundamentals.marketCap ?? "N/A"}`
    : "Financial data not available from structured APIs.";

  const priceStr = priceData
    ? `Current: $${priceData.currentPrice} | Change: ${priceData.changePercent}% | 52W Low: $${priceData.low52Week} | 52W High: $${priceData.high52Week}`
    : "Price data not available.";

  const sentimentStr = sentiment
    ? `${sentiment.label} (score: ${sentiment.score}) | ${sentiment.newsCount} articles this week | Bullish: ${sentiment.bullishPercent}% / Bearish: ${sentiment.bearishPercent}%`
    : "Sentiment data not available.";

  const webSnippet = (webResearch || "").slice(0, 3000);

  const prompt = `You are a senior equity research analyst. Write a detailed investment research report on ${companyName}.

COMPANY: ${companyProfile?.name || companyName} | Sector: ${companyProfile?.sector || "N/A"} | Country: ${companyProfile?.country || "N/A"}
FINANCIALS: ${financialStr}
PRICE: ${priceStr}
SENTIMENT: ${sentimentStr}
NEWS & RESEARCH:
${webSnippet}

Write a professional 500-700 word report covering:
1. Business Overview and Competitive Position
2. Financial Health Analysis (cite specific numbers)
3. Growth Drivers and Catalysts
4. Key Risks and Red Flags
5. Market Sentiment and News Impact
6. Overall Investment Outlook`;

  let analysisReport = await safeLLM([{ role: "user", content: prompt }]);

  // Simpler fallback if primary prompt fails
  if (!analysisReport) {
    analysisReport = await safeLLM([{
      role: "user",
      content: `Write a 400-word investment research report on ${companyName}. Cover: business model, financial health (${financialStr}), key growth drivers, main risks, and investment outlook.`,
    }]);
  }

  const fallbackReport = `
### Quick Overview
Research data for **${companyName}** has been collected via automated heuristics. 

#### Financial Highlights
- **Revenue Growth:** ${fundamentals?.revenueGrowth ? fundamentals.revenueGrowth + '%' : 'Data unavailable'}
- **P/E Ratio:** ${fundamentals?.peRatio || 'Data unavailable'}
- **Profit Margin:** ${fundamentals?.profitMargin ? fundamentals.profitMargin + '%' : 'Data unavailable'}

#### Market Pricing
- **Current Price:** ${priceData?.currentPrice ? '$' + priceData.currentPrice : 'Data unavailable'}
- **Daily Change:** ${priceData?.changePercent ? priceData.changePercent + '%' : 'Data unavailable'}

#### News Sentiment
- **Overall Stance:** ${sentiment?.label || 'Neutral'} (${sentiment?.score || 0})
- **News Activity:** ${sentiment?.newsCount || 0} recent articles analyzed
- **Sentiment Split:** ${sentiment?.bullishPercent || 50}% Bullish / ${sentiment?.bearishPercent || 50}% Bearish

*Note: Detailed LLM analysis is currently unavailable due to strict API rate limits. This report is generated using local heuristics.*
`;

  analysisReport = analysisReport || fallbackReport;

  config?.writer?.("step_complete", { step: "synthesis", label: "✅ Research report complete" });

  return {
    analysisReport,
    completedSteps: [...(state.completedSteps || []), "synthesis"],
  };
}

// ─── Node 7: Decision ─────────────────────────────────────────────────────────
async function decisionNode(state, config) {
  config?.writer?.("step_start", { step: "decision", label: "⚖️ Making investment decision..." });

  const { companyName, analysisReport, fundamentals, priceData, sentiment } = state;

  const reportSnippet = (analysisReport || "").slice(0, 1800);
  const dataStr = JSON.stringify({
    peRatio: fundamentals?.peRatio,
    revenueGrowth: fundamentals?.revenueGrowth,
    profitMargin: fundamentals?.profitMargin,
    currentPrice: priceData?.currentPrice,
    changePercent: priceData?.changePercent,
    sentimentLabel: sentiment?.label,
    sentimentScore: sentiment?.score,
  });

  const prompt = `You are an investment analyst making a final decision on ${companyName}.

RESEARCH:
${reportSnippet}

KEY DATA: ${dataStr}

Respond with ONLY this JSON object (no extra text, no markdown):
{"decision":"INVEST","confidenceScore":72,"keyStrengths":["strength one","strength two","strength three"],"keyRisks":["risk one","risk two","risk three"],"bullCase":"Two to three sentences on why this could outperform.","bearCase":"Two to three sentences on downside risks.","reasoning":"Three to four sentences explaining the final decision.","recommendation":"One actionable sentence for the investor."}

Rules: decision must be INVEST, PASS, or NEUTRAL. confidenceScore is an integer 0-100.`;

  let raw = await safeLLM([{ role: "user", content: prompt }]);

  // Instant dynamic heuristic fallback if LLM is rate limited
  if (!raw) {
    const isBullish = sentiment?.score > 0;
    const isBearish = sentiment?.score < 0;
    const isGrowing = (fundamentals?.revenueGrowth || 0) > 0;
    
    let calcDecision = "NEUTRAL";
    if (isBullish && isGrowing) calcDecision = "INVEST";
    else if (isBearish || (fundamentals?.revenueGrowth || 0) < -10) calcDecision = "PASS";
    
    let calcScore = 50 + (sentiment?.score || 0) * 40;
    if (isGrowing) calcScore += 10;
    calcScore = Math.min(99, Math.max(1, Math.round(calcScore)));

    raw = JSON.stringify({
      decision: calcDecision,
      confidenceScore: calcScore,
      keyStrengths: [
        isGrowing ? "Positive revenue growth" : "Stable revenue",
        isBullish ? "Favorable news sentiment" : "Consistent news presence",
        "Market presence"
      ],
      keyRisks: [
        !isGrowing ? "Declining or flat revenue" : "Macroeconomic pressures",
        isBearish ? "Negative news sentiment" : "Market volatility",
        "Sector competition"
      ],
      bullCase: "If the company maintains its current trajectory and capitalizes on market opportunities, it could see upside.",
      bearCase: "If competitive pressures mount or macroeconomic conditions worsen, the stock could underperform.",
      reasoning: `Based on a heuristic analysis, the sentiment is ${sentiment?.label} and revenue growth is ${fundamentals?.revenueGrowth || 'N/A'}%.`,
      recommendation: calcDecision === "INVEST" ? "Consider allocating a position based on positive signals." : calcDecision === "PASS" ? "Avoid or sell due to negative signals." : "Monitor closely for clearer signals."
    });
  }

  let parsed = {};
  try {
    const match = (raw || "").match(/\{[\s\S]*\}/);
    if (match) parsed = JSON.parse(match[0]);
  } catch { /* fallback values used below */ }

  const decision = ["INVEST", "PASS", "NEUTRAL"].includes(parsed.decision) ? parsed.decision : "NEUTRAL";
  const confidenceScore = Number.isFinite(parsed.confidenceScore) ? parsed.confidenceScore : 50;

  config?.writer?.("step_complete", {
    step: "decision",
    label: `✅ Decision: ${decision} (${confidenceScore}% confidence)`,
  });

  return {
    decision,
    confidenceScore,
    keyStrengths:   Array.isArray(parsed.keyStrengths)   ? parsed.keyStrengths   : ["See full report"],
    keyRisks:       Array.isArray(parsed.keyRisks)       ? parsed.keyRisks       : ["See full report"],
    bullCase:       parsed.bullCase       || "Positive signals identified in research.",
    bearCase:       parsed.bearCase       || "Risks identified in research report.",
    reasoning:      parsed.reasoning      || "Decision based on all available research data.",
    recommendation: parsed.recommendation || "Review the full report before making a decision.",
    currentStep: "complete",
    completedSteps: [...(state.completedSteps || []), "decision"],
  };
}

// ─── Execute the Workflow ───────────────────────────────────────────────────────
export async function runResearchWorkflow(initialState, config) {
  let state = { ...AgentState, ...initialState };
  
  // 1. Company Resolver
  const resolverResult = await companyResolverNode(state, config);
  state = { ...state, ...resolverResult };

  // 2. Parallel Research (Web, Fundamentals, Price, Sentiment)
  const [webRes, fundRes, priceRes, sentRes] = await Promise.all([
    webResearchNode(state, config),
    fundamentalsNode(state, config),
    priceDataNode(state, config),
    sentimentNode(state, config),
  ]);
  
  state = { ...state, ...webRes, ...fundRes, ...priceRes, ...sentRes };

  // 3. Synthesis
  const synthesisResult = await synthesisNode(state, config);
  state = { ...state, ...synthesisResult };

  // 4. Decision
  const decisionResult = await decisionNode(state, config);
  state = { ...state, ...decisionResult };

  return state;
}
