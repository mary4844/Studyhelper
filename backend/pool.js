//db.js är databasanlutningen via pool, som i sin tur kan ta emot flera 
// requests samtidigt ist för att skapa ny anslutning varje gång 

// Import Pool from pg so we can talk to PostgreSQL.
const { Pool } = require("pg");
require("dotenv").config();

const isTest = process.env.NODE_ENV === 'test';

// Create one shared database connection pool for the whole backend.

if (process.env.DATABASE_URL) {
  // Render / produktion
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  // Lokal utveckling
  pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
  });
}

// exportera poolen (databasanalutningen) så att andra filer kan komma åt databasen.
module.exports = { pool };
