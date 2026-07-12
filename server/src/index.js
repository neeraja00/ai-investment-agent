// server/src/index.js
// Main Express server entry point

import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB, sequelize } from "./db/connect.js";
import { getResearchModel } from "./models/Research.js";
import { researchRouter } from "./routes/research.js";

const app = express();

// Connect to PostgreSQL and initialize models
await connectDB();
if (sequelize) {
  getResearchModel(); // Initialize the model
  try {
    await sequelize.sync();
    console.log("✅ PostgreSQL Database Synchronized");
  } catch (err) {
    console.error("⚠️  Failed to sync database:", err.message);
  }
}

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// Routes
app.use("/api", researchRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "AI Investment Research Agent Server Running 🚀" });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 Research API ready at http://localhost:${PORT}/api/research`);
  console.log(`\n✅ Required API Keys Loaded:`);
  console.log(`   Gemini:        ${process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "✅" : "❌ MISSING"}`);
  console.log(`   Tavily:        ${process.env.TAVILY_API_KEY ? "✅" : "⚠️  Optional"}`);
  console.log(`   Finnhub:       ${process.env.FINNHUB_API_KEY ? "✅" : "⚠️  Optional"}`);
  console.log(`   AlphaVantage:  ${process.env.ALPHA_VANTAGE_API_KEY ? "✅" : "⚠️  Optional"}`);
});
