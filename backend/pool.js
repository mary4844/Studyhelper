//db.js är databasanlutningen via pool, som i sin tur kan ta emot flera 
// requests samtidigt ist för att skapa ny anslutning varje gång 

// Import Pool from pg so we can talk to PostgreSQL.
const { Pool } = require("pg");

// Create one shared database connection pool for the whole backend.
// const pool = new Pool({
//   user: "olof",
//   host: "localhost",
//   database: "studyhacker",
//   password: "password123",
//   port: 5432,
// });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// exportera poolen (databasanalutningen) så att andra filer kan komma åt databasen.
module.exports = { pool };
