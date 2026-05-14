// Import express so we can create a router just for board-related routes.
const express = require("express");
// Import the shared database pool from db.js.
const { pool } = require("../pool");

// Create a router that will hold routes related to boards.
const router = express.Router();

router.get('/:date', async (req, res) => {
    try {
        const { date } = req.params;

        //behöver plocka datumet specifikt?
        const result = await pool.query(
            "SELECT * FROM tasks WHERE deadline = $1",
            [date]);
        
        
        
        return res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error("error fetching board:", error);
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;