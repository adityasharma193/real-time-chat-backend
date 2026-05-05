const { Pool } = require("pg");

const isProduction = process.env.DATABASE_URL;

const pool = isProduction
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // 🔥 required for Supabase
      },
    })
  : new Pool({
      user: "postgres",
      host: "localhost",
      database: "chatapp",
      password: "Aditya@123",
      port: 5432,
    });

// Test connection
pool.connect()
  .then(() => console.log("✅ PostgreSQL connected"))
  .catch(err => console.error("❌ DB connection error:", err));

module.exports = pool;