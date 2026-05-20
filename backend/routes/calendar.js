// Import express so we can create a router just for board-related routes.
const express = require("express");
// Import the shared database pool from db.js.
const { pool } = require("../pool");

const { requiresAuth } = require('express-openid-connect');

// Create a router that will hold routes related to boards.
const router = express.Router();

router.get('/:date', requiresAuth(), async (req, res) => {
    try {
        const { date } = req.params;
        const email = req.oidc.user.email;

        const user = await pool.query('SELECT * FROM users WHERE user_mail = $1', [email]);

        if (!user.rows[0]) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user_id = user.rows[0].user_id;

        const result = await pool.query(
            `SELECT tasks.* 
             FROM tasks
             JOIN subject_cards ON tasks.subject_card_id = subject_cards.subject_card_id
             JOIN board ON subject_cards.board_id = board.board_id
             JOIN user_board ON board.board_id = user_board.board_id
             WHERE tasks.deadline = $1
             AND user_board.user_id = $2`,
            [date, user_id]
        );
        
        return res.status(200).json(result.rows);

    } catch (error) {
        console.error("error fetching tasks:", error);
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;