const express = require("express");
const { pool } = require("../pool"); //importera db

const { requiresAuth } = require('express-openid-connect');

const router = express.Router({ mergeParams: true }); // create a small route container just for tasks
//detta är för att skapa en mini app i express, istället för att ha varje route i main app.js

const { emitSubTaskCreated,
        emitSubTaskDeleted,
        emitSubTaskEdit,
        emitSubTaskStatus } =
require('../socket_events/subtask_events');

// Return all tasks in task_id order. on one subject card
router.get("/", async (req, res) => {
  try {
    const { task_id } = req.params;

    const taskCheck = await pool.query('SELECT * FROM task WHERE task_id = $1', [task_id]);
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const result = await pool.query(
      `SELECT * 
      FROM subtask 
      WHERE task_id = $1 
      ORDER BY subtask_id`,
      [task_id]);

      //skickar hela objektet som innehåller task_name, task_id, deadline, user etc.
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching subtasks:", error);
      res.status(500).json({ error: "Failed to fetch subtasks" });
    }
  });
  
  // Create one new task.
router.post("/", async (req, res) => {
  try {
    const io = req.app.get('io');
      
      // Read the task name sent from the frontend body.
    const { board_id, task_id } = req.params;
      
      //deadline kan användas men vet inte hur
    const { subtask_name, deadline } = req.body;
      //lägg in att status är att den inte är klar
    const status = false;   
    
    if (!subtask_name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const taskCheck = await pool.query('SELECT * FROM task WHERE task_id = $1', [task_id]);
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
      //går det att lägga in deadline också?
    const result = await pool.query(
      `INSERT INTO subtask
      (task_id, subtask_name, deadline, status) 
      VALUES ($1, $2, $3, $4) RETURNING *`,
      [task_id, subtask_name, deadline, status]);
        
        //kanske lägga till user_id senare för att kunna "ta över en task" i gruppboardsen
        
    //osäker om det här funkar
    if (!result.rows[0]) {
      return res.status(404).json({ error: "subtask skapas inte" });
    }
        
    emitSubTaskCreated(io, board_id, result.rows[0]);
      // Send the created task back to the frontend.

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error creating subtask:", error);
    res.status(500).json({ error: error.message });
  }
});


//Ta bort en task med ett id
router.delete("/:subtask_id", async (req, res) => {
  try {
    const io = req.app.get('io');
    const { board_id, task_id, subtask_id } = req.params;

    const result = await pool.query(
      `DELETE FROM subtask 
      WHERE task_id = $1 
      AND subtask_id = $2 RETURNING *`,
      [task_id, subtask_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Koppling finns inte; FEL!' });
    }

    //Kanske inte behövs subtask_id i emiten
    emitSubTaskDeleted(io, board_id, subtask_id)
    res.status(204).send(); 
  } catch (error) {
    console.error("Error failed to delete subtask:", error);
    res.status(500).json({ error: "Failed to delete subtask" });
  }
});

//redigera namnet på en task med ett id
router.patch("/:subtask_id", async (req, res) => {
  try {
    const io = req.app.get('io');
    const { board_id, subtask_id } = req.params;
    const { subtask_name } = req.body;

    if (!subtask_name) {
      return res.status(400).json({ error: "New name is required" });
    }

    const result = await pool.query(
      `UPDATE subtask SET subtask_name = $1 WHERE subtask_id = $2 RETURNING *`,
      [subtask_name, subtask_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "subtask not found" });
    }

    emitSubTaskEdit(io, board_id, result.rows[0]);
    return res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error("Error updating subtask:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

router.patch('/:subtask_id/status', async (req, res) => {
  try{
    const io = req.app.get('io');
    const {board_id, task_id, subtask_id} = req.params;

    const status = await pool.query(
      'SELECT status FROM subtask WHERE subtask_id = $1 and task_id = $2',
      [subtask_id, task_id]
    )

    const current = status.rows[0]?.status;
    const new_status = await pool.query(
      `UPDATE subtask SET status = $1 WHERE subtask_id = $2 and task_id = $3 RETURNING *`,
      [!current, subtask_id, task_id]
    )

    if(new_status.rowCount === 0) {
      return res.status(404).json({ error: "subtask not found" })
    }

    emitSubTaskStatus(io, board_id, new_status.rows[0]);
    return res.status(200).json(new_status.rows[0]);
    
  } catch (error) {
    console.error("Error updating status:", error);
    return res.status(500).json({ error: "Server error"})
  }
})

//Möjliggör att app.js kan importera routern o dess funktioner
module.exports = router;
