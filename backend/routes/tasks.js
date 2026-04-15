// Import express so we can create a router just for task-related routes.
const express = require("express");
// Import the shared database pool from db.js.
const { pool } = require("../db");

// Create a router that will hold routes related to tasks.
const router = express.Router();

// Return all tasks in task_id order.
router.get("/", async (req, res) => {
  try {
    // Read all rows from the tasks table.
    const result = await pool.query("SELECT * FROM tasks ORDER BY task_id");
    // Send the task rows back as JSON.
    res.json(result.rows);
  } catch (error) {
    // Log the real error in the terminal for debugging.
    console.error("Error fetching tasks:", error);
    // Send a generic error message to the frontend.
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Create one new task.
router.post("/add", async (req, res) => {
  try {
    // Read the task name sent from the frontend body.
    const { name } = req.body;

    // Insert the new task and ask PostgreSQL to return the inserted row.
    const result = await pool.query(
      "INSERT INTO tasks (task_name) VALUES ($1) RETURNING *",
      [name],
    );

    // Send the created task back to the frontend.
    res.json(result.rows[0]);
  } catch (error) {
    // Log the real database error in the terminal.
    console.error("Error creating task:", error);
    // Return the error message so it's easier to debug while learning.
    res.status(500).json({ error: error.message });
  }
});

// Delete all tasks from the table.
router.post("/clear", async (req, res) => {
  try {
    // Remove every row from the tasks table.
    const result = await pool.query("DELETE FROM tasks");
    // Send back the database response as JSON.
    res.json(result.rows);
  } catch (error) {
    // Log the real error in the terminal.
    console.error("Error failed to clear list:", error);
    // Return a simple error message to the frontend.
    res.status(500).json({ error: "Failed to clear list" });
  }
});

// Export the router so app.js can mount it.
module.exports = router;
