import { Sequelize } from "sequelize";

export let sequelize = null;

export async function connectDB() {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    console.warn("⚠️  DATABASE_URL not found in .env. Skipping database connection.");
    return;
  }

  try {
    sequelize = new Sequelize(uri, {
      dialect: "postgres",
      logging: false, // Set to console.log to see SQL queries
    });

    await sequelize.authenticate();
    console.log("✅ PostgreSQL Connected Successfully via Sequelize");

    // We will sync the models after they are imported, but to avoid circular dependencies
    // it's often better to sync them in index.js or let the models file export the synced instance.
  } catch (error) {
    console.error("❌ PostgreSQL Connection Failed:", error.message);
    sequelize = null;
  }
}
