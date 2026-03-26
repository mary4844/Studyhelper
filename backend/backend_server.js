const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("."));

const PORT = 3000;

const pool = new Pool({ 
  user: "postgres",
  host: "localhost",
  database: "studyhacker",
  password: "SQLpassword",
  port: 5432,
});

app.get("/tasks", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks ORDER BY task_id");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

app.post("/add_task", async (req, res) => {
    console.log("entered add task");

  try {
    const { name } = req.body

    console.log('New message:', name);

    const result = await pool.query(
      "INSERT INTO tasks (task_name) VALUES ($1) RETURNING *",
      [name]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

app.post("/create_board", async (req, res) => {
  try {
    const { name } = req.body

    // console.log('New message:', name)

    const result = await pool.query(
      "INSERT INTO board (title) VALUES ($1) RETURNING *",
      [name]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error creating board:", error);
    res.status(500).json({ error: "Failed to create board" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
