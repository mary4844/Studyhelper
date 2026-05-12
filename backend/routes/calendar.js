// Import express so we can create a router just for board-related routes.
const express = require("express");
// Import the shared database pool from db.js.
const { pool } = require("../pool");

// Create a router that will hold routes related to boards.
const router = express.Router();

router.get('/:task_id', async (req, res) => {
    try {
        const { task_id } = req.params;

        const result = await pool.query("SELECT * FROM tasks WHERE id = $1"[task_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
            error: "Task not found"
            })
        }

        return res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error("error fetching board:", error);
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;