// Import express so we can create a router just for board-related routes.
const express = require("express");
// Import the shared database pool from db.js.
const { pool } = require("../pool");

// Create a router that will hold routes related to boards.
const router = express.Router();

// Create one new board.
router.post("/create", async (req, res) => {
  try {
    // Read the board name sent from the frontend body.
    const { name } = req.body;

    // Insert the new board and ask PostgreSQL to return the inserted row.
    const result = await pool.query(
      "INSERT INTO board (board_name) VALUES ($1) RETURNING *",
      [name],
    );

    // Send the created board back to the frontend.
    res.json(result.rows[0]);
  } catch (error) {
    // Log the real error in the terminal for debugging.
    console.error("Error creating board:", error);
    // Send a simple error message to the frontend.
    res.status(500).json({ error: "Failed to create board" });
  }
});

// Export the router so app.js can mount it.
module.exports = router;
