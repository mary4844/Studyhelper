// Import express so we can create a router just for card-related routes.
const express = require("express");
// Import the shared database pool from db.js.
const { pool } = require("../pool");

const { requiresAuth } = require('express-openid-connect'); //new

//lets subcards hand off requests to tasks.js
const tasksRouter = require("./tasks");

// Create a router that will hold routes related to boards.
const router = express.Router({ mergeParams: true });

router.use('/:subject_card_id/tasks', tasksRouter);

const { emitCardCreated, 
        emitCardDeleted, 
        emitCardEdit } = 
require('../socket_events/subcard_events')

//create subject card
router.post('/', requiresAuth(), async (req, res) => { //requires auth ?
    try {
        const io = req.app.get('io');

        const { board_id } = req.params;
        const { subject_card_name } = req.body;

        if (!subject_card_name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        //vi tänker att man inte behöver veta mer än såhär att det borde funka iallafall. 

        const result = await pool.query(
            `INSERT INTO subject_cards
            (board_id, subject_card_name)
            VALUES ($1, $2) RETURNING *`,
            [board_id, subject_card_name]);

        //den här delen funkar inte den returnerar 500 om det inte finns någon board
        if (!result.rows[0]) {
            return res.status(404).json({ error: 'subject card skapas inte' });
        }

        emitCardCreated(io, board_id, result.rows[0]);
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

        const result = await pool.query(
            `SELECT * 
            FROM subject_cards 
            WHERE board_id = $1`,
            [board_id]);
 
        //behöver ingen emit
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching subject cards:", error);
        res.status(500).json({ error: "Failed to fetch subject cards" });
    }
})

// deleteSubjectCardById
router.delete('/:subject_card_id', requiresAuth(), async (req, res) => { //requires auth ?
    try {
        const io = req.app.get('io');
        const { board_id, subject_card_id } = req.params;

        const result = await pool.query(
            `DELETE FROM subject_cards 
            WHERE subject_card_id = $1 
            AND board_id = $2 RETURNING *`,
            [subject_card_id, board_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Card is not connected to this board' });
        }
        emitCardDeleted(io, board_id, subject_card_id);
        res.status(204).send();
    } catch (error) {
        console.error("error deleting subcard:", error);
        return res.status(500).json({ error: "Server error" });
    }
})

//edit a card
router.patch('/:subject_card_id', requiresAuth(), async (req, res) => {
    try {
        const io = req.app.get('io');

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

        emitCardEdit(io, board_id, result.rows[0]);
        res.status(200).json(result.rows[0]);

    }catch (error) {
        console.error("Error updating card:", error);
        return res.status(500).json({ error: "Server error" });
    }
})


//vi tycker att vi inte behöver patch :)
module.exports = router;