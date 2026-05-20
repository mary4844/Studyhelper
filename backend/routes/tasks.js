const express = require("express");
const { pool } = require("../pool"); //importera db

const { requiresAuth } = require('express-openid-connect');

const router = express.Router({ mergeParams: true }); // create a small route container just for tasks
//detta är för att skapa en mini app i express, istället för att ha varje route i main app.js

const { emitTaskCreated,
        emitTaskDeleted,
        emitTaskEdit,
        emitTaskStatus } =
require('../socket_events/task_events');

// Return all tasks in task_id order. on one subject card
router.get("/", async (req, res) => {
  try {
    const { subject_card_id } = req.params;

    //kolla om subject card finns med quary
    
    const result = await pool.query(
      `SELECT * 
      FROM tasks 
      WHERE subject_card_id = $1 
      ORDER BY task_id`,
      [subject_card_id]);

      //skickar hela objektet som innehåller task_name, task_id, deadline, user etc.
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });
  
  // Create one new task.
router.post("/", async (req, res) => {
  try {
    const io = req.app.get('io');
      
      // Read the task name sent from the frontend body.
    const { board_id, subject_card_id } = req.params;
      
      //deadline kan användas men vet inte hur
    const { task_name, deadline } = req.body;
      //lägg in att status är att den inte är klar
    const status = false;   
    
    if (!task_name) {
      return res.status(400).json({ error: 'Name is required' });
    }

      //går det att lägga in deadline också?
    const result = await pool.query(
      `INSERT INTO tasks
      (subject_card_id, task_name, deadline, status) 
      VALUES ($1, $2, $3, $4) RETURNING *`,
      [subject_card_id, task_name, deadline, status]);
        
        //kanske lägga till user_id senare för att kunna "ta över en task" i gruppboardsen
        
    if (!result.rows[0]) {
      return res.status(404).json({ error: "Task skapas inte" });
    }
        
    emitTaskCreated(io, board_id, result.rows[0]);
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
    const io = req.app.get('io');
    const { board_id, subject_card_id, task_id } = req.params;

    const result = await pool.query(
      `DELETE FROM tasks 
      WHERE subject_card_id = $1 
      AND task_id = $2 RETURNING *`,
      [subject_card_id, task_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Koppling finns inte; FEL!' });
    }

    //Kanske inte behövs task_id i emiten
    emitTaskDeleted(io, board_id, task_id)
    res.status(204).send(); 
  } catch (error) {
    console.error("Error failed to clear list:", error);
    res.status(500).json({ error: "Failed to clear list" });
  }
});

//redigera namnet på en task med ett id
router.patch("/:task_id", async (req, res) => {
  try {
    const io = req.app.get('io');
    const { board_id, task_id } = req.params;
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

    emitTaskEdit(io, board_id, result.rows[0]);
    return res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error("Error updating task:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

router.patch('/:task_id/status', async (req, res) => {
  try{
    const io = req.app.get('io');
    const {board_id, subject_card_id, task_id} = req.params;

    const status = await pool.query(
      'SELECT status FROM tasks WHERE task_id = $1 and subject_card_id = $2',
      [task_id, subject_card_id]
    )

    const current = status.rows[0]?.status;
    const new_status = await pool.query(
      `UPDATE tasks SET status = $1 WHERE task_id = $2 and subject_card_id = $3 RETURNING *`,
      [!current, task_id, subject_card_id]
    )

    if(new_status.rowCount === 0) {
      return res.status(404).json({ error: "Task not found" })
    }

    emitTaskStatus(io, board_id, new_status.rows[0]);
    return res.status(200).json(new_status.rows[0]);
    
  } catch (error) {
    console.error("Error updating status:", error);
    return res.status(500).json({ error: "Server error"})
  }
})

router.get('/:date', async (req, res) => {
    try {
        const { date } = req.params;

        //behöver plocka datumet specifikt?
        const result = await pool.query(
            "SELECT * FROM tasks WHERE deadline = $1",
            [date]);
        
        return res.status(200).json(result.rows);

    } catch (error) {
        console.error("error fetching board:", error);
        return res.status(500).json({ error: "Server error" });
    }
});

//Möjliggör att app.js kan importera routern o dess funktioner
module.exports = router;
