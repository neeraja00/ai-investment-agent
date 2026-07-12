// server/src/routes/research.js
// Express routes — POST /api/research (SSE streaming) + GET /api/history

import express from "express";
import { runResearchWorkflow } from "../agent/graph.js";
import { getResearchModel } from "../models/Research.js";

export const researchRouter = express.Router();

// ─── POST /api/research  (SSE stream) ────────────────────────────────────────
researchRouter.post("/research", async (req, res) => {
  const { companyName } = req.body;

  if (!companyName || typeof companyName !== "string" || companyName.trim().length < 2) {
    return res.status(400).json({ error: "Please provide a valid company name." });
  }

  // ── Set up SSE headers ──
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const send = (type, data) => {
    res.write(`data: ${JSON.stringify({ type, ...data, timestamp: Date.now() })}\n\n`);
  };

  const startTime = Date.now();

  // Writer function passed into each node via config
  const writer = (type, data) => send(type, data);

  try {
    send("start", { message: `Starting research on "${companyName.trim()}"...` });

    // Run the native async workflow — passing writer so nodes can emit SSE events
    const finalState = await runResearchWorkflow(
      {
        companyName: companyName.trim(),
        completedSteps: [],
      },
      {
        writer, // custom field picked up by each node
      }
    );

    const researchTime = Date.now() - startTime;
    
    const resultPayload = {
      companyName: finalState.companyName,
      tickerSymbol: finalState.tickerSymbol,
      companyProfile: finalState.companyProfile,
      fundamentals: finalState.fundamentals,
      priceData: finalState.priceData,
      sentiment: finalState.sentiment,
      analysisReport: finalState.analysisReport,
      decision: finalState.decision,
      confidenceScore: finalState.confidenceScore,
      keyStrengths: finalState.keyStrengths,
      keyRisks: finalState.keyRisks,
      bullCase: finalState.bullCase,
      bearCase: finalState.bearCase,
      reasoning: finalState.reasoning,
      recommendation: finalState.recommendation,
      completedSteps: finalState.completedSteps,
      researchTime,
    };

    // Save to PostgreSQL if possible
    try {
      const Research = getResearchModel();
      if (Research) {
        await Research.create(resultPayload);
        console.log(`✅ Saved research for ${finalState.companyName} to PostgreSQL`);
      }
    } catch (dbErr) {
      console.warn("⚠️  Could not save to PostgreSQL:", dbErr.message);
    }

    send("final_result", { result: resultPayload });
  } catch (err) {
    console.error("Agent error:", err);
    send("error", { message: err.message || "Research failed. Please try again." });
  } finally {
    res.end();
  }
});

// ─── GET /api/health ─────────────────────────────────────────────────────────
researchRouter.get("/health", (req, res) => {
  res.json({
    status: "ok",
    apis: {
      gemini: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      tavily: !!process.env.TAVILY_API_KEY,
      finnhub: !!process.env.FINNHUB_API_KEY,
      alphaVantage: !!process.env.ALPHA_VANTAGE_API_KEY,
    },
  });
});

// ─── GET /api/history ────────────────────────────────────────────────────────
researchRouter.get("/history", async (req, res) => {
  try {
    const Research = getResearchModel();
    if (!Research) {
      return res.json([]); // Return empty if DB is not configured
    }
    const history = await Research.findAll({
      order: [["createdAt", "DESC"]],
      limit: 50,
    });
    res.json(history);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch research history from database." });
  }
});
