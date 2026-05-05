const express = require("express"); 
const { pool } = require("../pool"); //importera db

const router = express.Router(); // create a smal route container just for tasks
//detta är för att skapa en mini app i express, istället för att ha varje route i main app.js

// Return all tasks in task_id order.
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks ORDER BY task_id"); //query till db att läsa alla rader
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Create one new task.
router.post("/", async (req, res) => {
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
    console.error("Error creating task:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete all tasks from the table.
router.delete("/", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM tasks"); // ta bort alla rader ifrån tabellen.

    res.json(result.rows); //skicka db restultatet som JSON
  } catch (error) {
    console.error("Error failed to clear list:", error);
    res.status(500).json({ error: "Failed to clear list" });
  }
});

//Ta bort en task med ett id
router.delete("/:id", async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    const result = await pool.query(
      "DELETE FROM tasks WHERE task_id = $1 RETURNING *",
      [taskId],
    );
    res.json(result.rows[0]); //skicka db restultatet som JSON så slipper frontend göra en GET för att uppdatera
  } catch (error) {
    console.error("Error failed to clear list:", error);
    res.status(500).json({ error: "Failed to clear list" });
  }
});

//redigera namnet på en task med ett id
router.patch("/:id", async (req, res) => {
  try {
    const taskId = Number(req.params.id); //params värden ifrån URL path, body är data i request payload ex namn
    const name = req.body.name; // body är data i request payload ex namn
    const result = await pool.query(
      "UPDATE tasks SET task_name = $1 WHERE task_id = $2 RETURNING *",
      [name, taskId],
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

//Möjligör att app.js kan importera routern o dess funktioner
module.exports = router;
