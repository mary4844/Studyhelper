const express = require("express");
const { pool } = require("../pool"); //importera db

const { requiresAuth } = require('express-openid-connect');

const router = express.Router({ mergeParams: true }); // create a small route container just for tasks
//detta är för att skapa en mini app i express, istället för att ha varje route i main app.js

// Return all tasks in task_id order. on one subject card
router.get("/", async (req, res) => {
  try {
    //behövs board_id?
    const { subject_card_id } = req.params;
    
    result = await pool.query(
      `SELECT * 
      FROM tasks 
      WHERE card_id = $1 
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
    const { subject_card_id } = req.params;

    //deadline kan användas men vet inte hur
    const { task_name, deadline } = req.body;
    
    if (!task_name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    //går det att lägga in deadline också?
    const result = await pool.query(
      `INSERT INTO tasks
      (subject_card_id, task_name) 
      VALUES ($1, $2) RETURNING *`,
      [subject_card_id, task_name]);

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


//Ta bort en task med ett id
router.delete("/:task_id", async (req, res) => {
  try {
    const { subject_card_id, task_id } = req.params;

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
router.patch("/:task_id", requiresAuth(), async (req, res) => {
  try {
    const { task_id } = req.params;
    const { task_name } = req.body;

    if (!task_name) {
      return res.status(400).json({ error: "New name is required" });
    }

    const result = await pool.query(
      `UPDATE tasks SET task_name = $1 WHERE task_id = $2 RETURNING *`,
      [task_name, task_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    return res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error("Error updating task:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

//Möjliggör att app.js kan importera routern o dess funktioner
module.exports = router;