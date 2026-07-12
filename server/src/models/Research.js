import { DataTypes } from "sequelize";
import { sequelize } from "../db/connect.js";

// Since sequelize might be null if no connection string is provided,
// we export a getter for the model instead of immediately initializing it.
let Research = null;

export function getResearchModel() {
  if (Research) return Research;
  if (!sequelize) return null;

  Research = sequelize.define("Research", {
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tickerSymbol: {
      type: DataTypes.STRING,
    },
    companyProfile: {
      type: DataTypes.JSONB,
    },
    fundamentals: {
      type: DataTypes.JSONB,
    },
    priceData: {
      type: DataTypes.JSONB,
    },
    sentiment: {
      type: DataTypes.JSONB,
    },
    analysisReport: {
      type: DataTypes.TEXT,
    },
    decision: {
      type: DataTypes.STRING,
      validate: {
        isIn: [["INVEST", "PASS", "NEUTRAL"]],
      },
    },
    confidenceScore: {
      type: DataTypes.INTEGER,
    },
    keyStrengths: {
      type: DataTypes.JSONB,
    },
    keyRisks: {
      type: DataTypes.JSONB,
    },
    bullCase: {
      type: DataTypes.TEXT,
    },
    bearCase: {
      type: DataTypes.TEXT,
    },
    reasoning: {
      type: DataTypes.TEXT,
    },
    recommendation: {
      type: DataTypes.TEXT,
    },
    researchTime: {
      type: DataTypes.INTEGER,
    },
  }, {
    timestamps: true,
  });

  return Research;
}
