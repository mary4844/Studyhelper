// Import express so we can create a router just for card-related routes.
const express = require("express");
// Import the shared database pool from db.js.
const { pool } = require("../pool");

const { auth, requiresAuth } = require('express-openid-connect'); //new

//??
const tasksRouter = require("./tasks");

// Create a router that will hold routes related to boards.
const router = express.Router({ mergeParams: true });

router.use('/:subject_card_id/tasks', tasksRouter);

//create subject card
router.post('/', requiresAuth(), async (req, res) => { //requires auth ?
    try {
        const { board_id } = req.params;

        const { subject_card_name } = req.body;

        if (!subject_card_name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        //vi tänker att man inte behöver veta mer än såhär att det borde funka iallafall. 

        result = await pool.query(
            `INSERT INTO subject_cards
            (board_id, subject_card_name)
            VALUES ($1, $2) RETURNING *`,
            [board_id, subject_card_name]);

        if (!result.rows[0]) {
            return res.status(404).json({ error: 'subject card skapas inte' });
        }

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error creating subcard:", error);
        res.status(500).json({ error: "Failed to create subcard" });
    }
})

//get all subject cards for a specific board
router.get('/', requiresAuth(), async (req, res) => { //requires auth ?
    try {
        const { board_id } = req.params;

        result = await pool.query(
            `SELECT * 
            FROM subject_cards 
            WHERE board_id = $1`,
            [board_id]);

        if (!result.rows) {
            //ska det stå så? eller behöver man inte ens nån?
            return res.status(404).json('404 error: no cards found');
        }

        return res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching subject cards:", error);
        res.status(500).json({ error: "Failed to fetch subject cards" });
    }
})

// deleteSubjectCardById
router.delete('/:subject_card_id', requiresAuth(), async (req, res) => { //requires auth ?
    try {
        const { board_id, subject_card_id } = req.params;

        result = await pool.query(
            `DELETE FROM subject_cards 
            WHERE subject_card_id = $1 
            AND board_id = $2 RETURNING *`,
            [subject_card_id, board_id]);

        if (!result.rows) {
            return res.status(404).json({ error: 'Koppling finns inte; FEL!' });
        }

        res.status(204).send();
    } catch (error) {
        console.error("error deleting subcard:", error);
        return res.status(500).json({ error: "Server error" });
    }
})

//edit a card
router.patch('/:subject_card_id', requiresAuth(), async (req, res) => {
    try {
        const { board_id, subject_card_id } = req.params;
        const { subject_card_name } = req.body;

        if(!subject_card_name) {
            return res.status(400).json({ error: 'Behöver ett nytt namn'})
        }

        const result = await pool.query(
        `UPDATE subject_cards SET subject_card_name = $1 WHERE subject_card_id = $2 RETURNING *`,
        [subject_card_name, subject_card_id]
        );

        if(result.rowCount === 0) {
            return res.status(404).json({ error: 'Kort saknas'});
        }

        res.status(200).json(result.rows[0]);
    }catch (error) {
        console.error("Error updating card:", error);
        return res.status(500).json({ error: "Server error" });
    }
})


//vi tycker att vi inte behöver patch :)
module.exports = router;