//db.js är databasanlutningen via pool, som i sin tur kan ta emot flera 
// requests samtidigt ist för att skapa ny anslutning varje gång 

// Import Pool from pg so we can talk to PostgreSQL.
const { Pool } = require("pg");
require("dotenv").config();

// Create one shared database connection pool for the whole backend.
const pool = new Pool({ 
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "study_tracker",
  password: process.env.DB_PASSWORD || "1337",
  port: Number(process.env.DB_PORT || 5432),
});

// exportera poolen (databasanalutningen) så att andra filer kan komma åt databasen.
module.exports = { pool };
