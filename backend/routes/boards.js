// Import express so we can create a router just for board-related routes.
const express = require("express");
// Import the shared database pool from db.js.
const { pool } = require("../pool");

// Create a router that will hold routes related to boards.
const router = express.Router();

//get all tasks in a board
router.get(":boardId", async (req, res) => {
  try {

    const boardId = Number(req.params.boardId);

    const result = await pool.query(
      `
      SELECT tasks.*
      FROM tasks
      JOIN board_task
        ON tasks.task_id = board_task.task_id
      WHERE board_task.board_id = $1
      ORDER BY tasks.task_id
      `,
      [boardId]
    );

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch board tasks"
    });
  }
});



//get all boards
router.get('/', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM board ORDER BY board_id");
    return res.status(200).json(result.rows);

  } catch (error) {
    console.error("Error fetching boards:", error);
    res.status(500).json({ error: "Failed to fetch boards" });
  }
})

//get board by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query("SELECT * FROM board WHERE id = $1", [id]);
    
    if(result.rows.length === 0) {
      return res.status(404).json(result.rows[0])
    }

    return res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error("error fetching board:", error);
    return res.status(500).json({ error: "Server error" });
  }
})


// Create one new board.
router.post("/", async (req, res) => {
  try {
    // Read the board name sent from the frontend body.
    const { boardName } = req.body;

    if(!boardName) {
      return res.status(400).json({ error: 'Name is required'});
    }

    // Insert the new board and ask PostgreSQL to return the inserted row.
    const result = await pool.query(
      "INSERT INTO board (board_name) VALUES ($1) RETURNING *",
      [boardName],
    );
    //return the status code that the creation worked.
    return res.status(201).json(result.rows[0]);

    // Send the created board back to the frontend.
  } catch (error) {
    // Log the real error in the terminal for debugging.
    console.error("Error creating board:", error);
    // Send a simple error message to the frontend.
    res.status(500).json({ error: "Failed to create board" });
  }
});

//delete all boards
router.delete('/', async (req, res) => {
  try {
    //test om det går att ta bort board om allt associerat ocskå tas bort
    await pool.query("DELETE FROM board_task");
    await pool.query("DELETE FROM user_board");
    await pool.query("DELETE FROM board");
    return res.status(204).send();

  } catch (error) {
    console.log("Error failed to delete boards ");
    res.status(500).json({error: "Failed to delete boards"});
  }
})


//delete board by id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query("DELETE FROM board WHERE id = $1", [id]);

    if(result.rowCount === 0) {
      return res.status(404).json({ error: "result not found"});
    }

    res.status(204).send();

  } catch (error) {
    console.error("error deleting board:", error);
    return res.status(500).json({ error: "Server error" });
  }
})


// Export the router so app.js can mount it.
module.exports = router;
