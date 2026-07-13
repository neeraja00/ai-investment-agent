# AI Investment Research Agent

## Overview — what it does
AlphaAgent is an autonomous, AI-powered investment research agent. Given a company name or ticker symbol, it provides a clear **INVEST**, **PASS**, or **NEUTRAL** recommendation. 
It accomplishes this by orchestrating a parallel execution pipeline that:
1. Queries real-time news.
2. Extracts financial fundamentals.
3. Fetches historical market data.
4. Assesses market sentiment.
5. Feeds this raw data into Google's **Gemini 1.5 Flash** LLM to synthesize a comprehensive research report.

## How to run it — setup and run steps
Follow these step-by-step instructions to get the project running locally.

### Step 1: Prerequisites
Ensure you have the following installed on your system:
- **Node.js** (v18 or higher)
- **PostgreSQL** (running locally)

### Step 2: Install Dependencies
Open your terminal and install dependencies for both the server and client:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 3: Configure Environment Variables
Create a `.env` file inside the `server` directory and add the following keys. Replace the placeholder values with your actual API keys and database credentials:
```env
PORT=5000
CLIENT_URL=http://localhost:5173

# PostgreSQL Connection (Update YOUR_PASSWORD)
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/ai_investement

# Required API Keys
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
TAVILY_API_KEY=your_tavily_key
FINNHUB_API_KEY=your_finnhub_key
ALPHA_VANTAGE_API_KEY=your_alphavantage_key
```

### Step 4: Database Setup
1. Open `pgAdmin` or your PostgreSQL CLI.
2. Create a new database named `ai_investement`.
3. The application will automatically synchronize and create the necessary tables on startup.

### Step 5: Start the Application
You will need two separate terminal windows to run the frontend and backend concurrently.

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```
Once both are running, open your browser and navigate to `http://localhost:5173`.

## How it works — your approach and architecture
The architecture is divided into a frontend dashboard and an asynchronous backend pipeline.

- **Frontend (React + Vite):** A responsive dashboard that provides a polished user interface. It utilizes Server-Sent Events (SSE) to stream live progress updates from the backend agent while the research is being conducted.
- **Backend (Node.js + Express):** An orchestration pipeline that processes requests in the following steps:
  1. **Ticker Resolution:** Gemini resolves the user's input (company name) into a valid stock ticker.
  2. **Parallel Data Extraction:** The agent uses `Promise.all()` to simultaneously fetch data from multiple sources:
     - *Tavily:* Web news and context.
     - *Finnhub:* Financial fundamentals and sentiment.
     - *Yahoo/AlphaVantage:* Historical price data.
  3. **AI Synthesis:** The aggregated data is structured into a JSON payload and sent to Gemini to generate a structured report outlining the Bull and Bear cases.
  4. **Data Persistence:** The generated report is saved to PostgreSQL using the Sequelize ORM.

## Key decisions & trade-offs
- **Native Orchestration over LangGraph:** I initially considered LangGraph for state management but opted for native JavaScript `async/await` and `Promise.all()`. This decision drastically reduced dependency bloat and improved execution speed. I retained `@langchain/google-genai` specifically for secure and structured LLM prompting.
- **PostgreSQL over NoSQL (MongoDB):** I chose PostgreSQL because its `JSONB` data type handles deeply nested financial data efficiently from our API sources, while still allowing relational features (like user accounts) to be easily added in the future.
- **Yahoo Finance Fallbacks:** The Finnhub free tier occasionally returned missing volume data. To ensure robust price charts, I built a custom Yahoo Finance scraper as a fallback mechanism.
- **Trade-off - Rate Limits:** Free-tier APIs (especially Gemini) have strict rate limits. To handle this gracefully, I implemented heuristic fallbacks. If an API hits a 429 error, the app degrades gracefully instead of crashing the server, trading off absolute data completeness for system stability.

## Example runs — your agent’s output on a few companies of your choice
- **Nvidia (NVDA):** 
  - *Agent Output:* **INVEST (85% Confidence)**
  - *Data Captured:* Highlighted massive revenue growth and P/E ratios.
  - *Key Notes:* The agent cited dominant AI chip market share but flagged geopolitical risks and high valuation multiples as the bear case.
- **Apple (AAPL):**
  - *Agent Output:* **INVEST (78% Confidence)**
  - *Data Captured:* Solid fundamentals but lagging slightly in generative AI news.
  - *Key Notes:* The decision was driven by strong free cash flow and ecosystem lock-in.
- **Microsoft (MSFT):**
  - *Agent Output:* **INVEST (82% Confidence)**
  - *Data Captured:* Highlighted massive cloud computing (Azure) revenue growth and strategic AI investments.
  - *Key Notes:* Cited strong enterprise software dominance and recurring revenue, while noting high valuation multiples as a minor risk.

## What you would improve with more time
- **WebSockets Implementation:** Replace Server-Sent Events (SSE) with full WebSockets for robust bi-directional communication.
- **Redis Caching:** Implement a caching layer. If a user searches for a company recently researched, the system should return the cached report from PostgreSQL instead of running an expensive LLM pipeline again.
- **Technical Indicators:** Integrate specialized tools for calculating RSI, MACD, and moving averages to provide the LLM with deeper quantitative data.
- **User Authentication:** Add NextAuth or JWT to allow users to maintain personal portfolios and a private history of their research.
