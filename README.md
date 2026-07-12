# 📈 AlphaAgent: AI Investment Research Agent

## 1. Overview
AlphaAgent is an autonomous, AI-powered investment research agent. Given a company name or ticker symbol, the agent orchestrates a parallel execution pipeline to query real-time news, extract financial fundamentals, fetch historical market data, and assess market sentiment. It then feeds this raw data into Google's **Gemini 1.5 Flash** LLM to synthesize a comprehensive research report, ultimately delivering a clear **INVEST**, **PASS**, or **NEUTRAL** decision.

## 2. How to run it

### Prerequisites
- Node.js (v18+)
- PostgreSQL (running locally)

### Setup Steps
1. **Install Dependencies:**
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   CLIENT_URL=http://localhost:5173
   
   # PostgreSQL Connection (Update with your local postgres password)
   DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/ai_investement
   
   # API Keys
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
   TAVILY_API_KEY=your_tavily_key
   FINNHUB_API_KEY=your_finnhub_key
   ALPHA_VANTAGE_API_KEY=your_alphavantage_key
   ```

3. **Database Setup:**
   - Open `pgAdmin` or your terminal and create a database named `ai_investement`. The app will automatically synchronize the tables on boot.

4. **Run the Application:**
   Open two terminals:
   ```bash
   # Terminal 1: Backend
   cd server && npm run dev
   
   # Terminal 2: Frontend
   cd client && npm run dev
   ```
   Navigate to `http://localhost:5173` in your browser.

## 3. How it works
- **Frontend (React + Vite):** A responsive, dark-mode dashboard that uses Server-Sent Events (SSE) to stream live progress updates from the agent while it researches.
- **Backend (Node + Express):** An asynchronous orchestration pipeline. When a request is received:
  1. **Ticker Resolution:** Gemini resolves the company name to a stock ticker.
  2. **Parallel Extraction:** The agent simultaneously fetches data from Tavily (Web News), Finnhub (Fundamentals/Sentiment), and Yahoo/AlphaVantage (Price Data) using `Promise.all()`.
  3. **AI Synthesis:** The aggregated JSON payload is passed back to Gemini to synthesize a structured report with Bull/Bear cases.
  4. **Persistence:** The final report is saved to PostgreSQL using the Sequelize ORM.

## 4. Key decisions & trade-offs
- **Removed LangGraph for Native Orchestration:** Initially, LangGraph was used to manage the agent's state. I chose to rip it out and replace it with native JavaScript `async/await` and `Promise.all()`. This drastically reduced dependency bloat and improved execution speed, while retaining `@langchain/google-genai` for secure LLM prompting.
- **PostgreSQL over MongoDB:** I migrated from NoSQL to PostgreSQL. Postgres's `JSONB` data type perfectly handles the deeply nested financial objects returned by the APIs, while leaving the door open for future relational features (like User Accounts).
- **Yahoo Finance Fallbacks:** The Finnhub free tier frequently returned `N/A` for volume data. I built a custom Yahoo Finance scraper as a fallback to ensure accurate, robust price charts.
- **Trade-off - Rate Limits:** To accommodate the strict rate limits of free-tier APIs (especially Gemini), I implemented heuristic fallbacks. If the API hits a 429 error, the app gracefully degrades rather than crashing the server.

## 5. Example runs
- **Nvidia (NVDA):** 
  - *Data Captured:* Highlighted massive revenue growth and P/E ratios.
  - *AI Decision:* **INVEST (85% Confidence)** based on dominant AI chip market share. 
  - *Bear Case Note:* Flagged geopolitical risks and high valuation multiples.
- **Apple (AAPL):**
  - *Data Captured:* Solid fundamentals but lagging slightly in generative AI news.
  - *AI Decision:* **INVEST (78% Confidence)**, citing strong free cash flow and ecosystem lock-in.
- **Microsoft (MSFT):**
  - *Data Captured:* Highlighted massive cloud computing (Azure) revenue growth and strategic AI investments (OpenAI partnership).
  - *AI Decision:* **INVEST (82% Confidence)**, citing strong enterprise software dominance and recurring revenue, while noting high valuation multiples as a minor risk.

## 6. What I would improve with more time
- **WebSockets:** Replace Server-Sent Events (SSE) with full WebSockets for bi-directional communication.
- **Redis Caching:** Implement a caching layer so that if a user searches "Apple" twice in one day, it returns the cached Postgres report instead of re-running the expensive LLM pipeline.
- **Technical Indicators:** Add specialized tools for calculating RSI, MACD, and moving averages to give the LLM better quantitative data.
- **Authentication:** Add NextAuth or JWT so users can have personal portfolios and private research histories.
