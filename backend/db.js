// Import Pool from pg so we can talk to PostgreSQL.
const { Pool } = require("pg");

// Create one shared database connection pool for the whole backend.
const pool = new Pool({
  // This is the database user the backend logs in with.
  user: "postgres",
  // This tells pg that the database is running on this computer.
  host: "localhost",
  // This is the exact database name we want to connect to.
  database: "demo studyhacker",
  // This is the password for the database user above.
  password: "asdf",
  // PostgreSQL uses port 5432 by default.
  port: 5432,
});

// Export the pool so route files can reuse the same connection setup.
module.exports = { pool };
