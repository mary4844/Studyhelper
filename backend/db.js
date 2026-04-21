// Import Pool from pg so we can talk to PostgreSQL.
const { Pool } = require("pg");

const pool = new Pool({
  // This is the database user the backend logs in with.
  user: "olof",
  host: "localhost",
  database: "studyhacker",
  password: "password123",
  port: 5432,
});

// Export the pool so route files can reuse the same connection setup.
module.exports = { pool };
