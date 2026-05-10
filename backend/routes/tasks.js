const express = require("express"); 
const { pool } = require("../pool"); //importera db

const router = express.Router(); // create a smal route container just for tasks
//detta är för att skapa en mini app i express, istället för att ha varje route i main app.js

//hjäplfunktioner till sockets
const { getBoardByTaskId } = require("../socket/task_helpers");
const { emitTaskUpdated } = require("../socket/task_events");

// Return all tasks in task_id order.
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks ORDER BY task_id"); //query till db att läsa alla rader

    const allTasks = result.rows;

    res.json(allTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Create one new task.
router.post("/", async (req, res) => {
  try {
    const io = req.app.get("io");

    const { name, boardId } = req.body;

    const taskResult = await pool.query(
      "INSERT INTO tasks (task_name) VALUES ($1) RETURNING *",
      [name]
    );

    const newTask = taskResult.rows[0];

    //connect task to board
    await pool.query(
      "INSERT INTO board_task (board_id, task_id) VALUES ($1, $2)",
      [boardId, newTask.task_id]
    );

    //emit 
    io.to(String(boardId)).emit("task created", newTask);

    //return reponse
    res.json(newTask);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete all tasks from the table.
router.delete("/", async (req, res) => {
  try {
    const io = req.app.get("io");

    await pool.query("DELETE FROM tasks");

    io.emit("tasks:deleted");

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear list" });
  }
});

//Ta bort en task med ett id
router.delete("/:id", async (req, res) => {
  try {
    const io = req.app.get("io");

    const taskId = Number(req.params.id);
    const result = await pool.query(
      "DELETE FROM tasks WHERE task_id = $1 RETURNING *",
      [taskId],
    );

    const deletedTask = result.rows[0]

    const boardId = await getBoardByTaskId(taskId);
    if(boardId) {
      emitTaskDeleted(io, deletedTask, boardId);
    }

    res.json(deletedTask); //skicka db restultatet som JSON så slipper frontend göra en GET för att uppdatera
  } catch (error) {
    console.error("Error failed to clear list:", error);
    res.status(500).json({ error: "Failed to clear list" });
  }
});


//redigera namnet på en task med ett id
router.patch("/:id", async (req, res) => {
  try {
    //låt den här routen använda socket.io servern
    const io = req.app.get("io");

    //taskens id och namn, body är data i request payload ex namn
    const taskId = Number(req.params.id);
    const { name } = req.body;

    const result = await pool.query(
      "UPDATE tasks SET task_name = $1 WHERE task_id = $2 RETURNING *",
      [name, taskId]
    );

    const updatedTask = result.rows[0];

    //hitta rätt id och skicka till dem med sockets
    const boardId = await getBoardByTaskId(taskId);
    if(boardId) {
      emitTaskUpdated(io, updatedTask, boardId);
    }

    //test om databas updateras som den ska
    console.log(result.rows[0]); 
    
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: "Failed to update task" });
  }
});

//Möjligör att app.js kan importera routern o dess funktioner
module.exports = router;
