const express = require("express");
const { pool } = require("../pool"); //importera db

const router = express.Router({ mergeParams: true }); // create a smal route container just for tasks
//detta är för att skapa en mini app i express, istället för att ha varje route i main app.js

// Return all tasks in task_id order. on one subject card
router.get("/", async (req, res) => {
  try {
    const { board_id, subject_card_id } = req.params;

    result = await pool.query(
      `SELECT * 
      FROM tasks 
      WHERE subject_card_id = $1 
      ORDER BY task_id`,
      [subject_card_id]);

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

    const { board_id, subject_card_id } = req.params;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    result = await pool.query(
      `INSERT INTO tasks
      (subject_card_id, task_name) 
      VALUES ($1) RETURNING *`,
      [subject_card_id, name]);

    //kanske lägga till user_id senare för att kunna "ta över en task" i gruppboardsen
    //ska mna typ lägga in deadline direkt?? 

    if (!result.rows[0]) {
      return res.status(404).json({ error: "Task skapas inte" });
    }
    // Send the created task back to the frontend.
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: error.message });
  }
});

// // Delete all tasks from the subject card.
// router.delete("/", async (req, res) => {
//   try {
//     const result = await pool.query("DELETE FROM tasks"); // ta bort alla rader ifrån tabellen.

//     res.json(result.rows); //skicka db restultatet som JSON
//   } catch (error) {
//     console.error("Error failed to clear list:", error);
//     res.status(500).json({ error: "Failed to clear list" });
//   }
// });

//Ta bort en task med ett id
router.delete("/:task_id", async (req, res) => {
  try {
    // const taskId = Number(req.params.id);
    const { board_id, subject_card_id, task_id } = req.params;

    result = await pool.query(
      `DELETE FROM tasks 
      WHERE subject_card_id = $1 
      AND task_id = $2 RETURNING *`,
      [subject_card_id, task_id]);

    if (!result.rows) {
      return res.status(400).json({ error: 'Koppling finns inte; FEL!' });
    }

    res.json(result.rows[0]); //skicka db restultatet som JSON så slipper frontend göra en GET för att uppdatera
  } catch (error) {
    console.error("Error failed to clear list:", error);
    res.status(500).json({ error: "Failed to clear list" });
  }
});

//redigera namnet på en task med ett id
// router.patch("/:id", async (req, res) => {
//   try {
//     const taskId = Number(req.params.id); //params värden ifrån URL path, body är data i request payload ex namn
//     const name = req.body.name; // body är data i request payload ex namn
//     const result = await pool.query(
//       "UPDATE tasks SET task_name = $1 WHERE task_id = $2 RETURNING *",
//       [name, taskId],
//     );
//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error("Error updating task:", error);
//     res.status(500).json({ error: "Failed to update task" });
//   }
// });


//Möjliggör att app.js kan importera routern o dess funktioner
module.exports = router;