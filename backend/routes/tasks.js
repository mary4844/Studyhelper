// Import express so we can create a router just for card-related routes.
const express = require("express");
// Import the shared database pool from db.js.
const { pool } = require("../pool");

const { requiresAuth } = require('express-openid-connect'); //new

//lets subcards hand off requests to tasks.js
const subtasksRouter = require("./subtasks");

// Create a router that will hold routes related to boards.
const router = express.Router({ mergeParams: true });

router.use('/:tasks/subtasks', subtasksRouter);

const { emitTaskCreated, 
        emitTaskDeleted, 
        emitTaskEdit } = 
require('../socket_events/task_events')

//create subject card
router.post('/', requiresAuth(), async (req, res) => { //requires auth ?
    try {
        const io = req.app.get('io');

        const { board_id } = req.params;
        const { task_name } = req.body;

        if (!task_name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        // det här kan man använda för att kolla om en board finns eller inte
        // tror det är det som den delen som inte funkar försöker göra 

        // const board = await pool.query(
        //     `SELECT * FROM board WHERE board_id = $1`, [board_id]
        // );
        // if (!board.rows[0]) {
        //     return res.status(404).json({ error: 'Board hittades inte' });
        // }

        const result = await pool.query(
            `INSERT INTO task
            (board_id, task_name)
            VALUES ($1, $2) RETURNING *`,
            [board_id, task_name]);

        //den här delen funkar inte den returnerar 500 om det inte finns någon board
        if (!result.rows[0]) {
            return res.status(404).json({ error: 'task skapas inte' });
        }

        emitTaskCreated(io, board_id, result.rows[0]);
        return res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ error: "Failed to create task" });
    }
})

//get all tasks for a specific board
router.get('/', requiresAuth(), async (req, res) => { //requires auth ?
    try {
        const { board_id } = req.params;

        const result = await pool.query(
            `SELECT * 
            FROM task 
            WHERE board_id = $1`,
            [board_id]);
 
        //behöver ingen emit
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
})

// deleteTaskById
router.delete('/:task_id', requiresAuth(), async (req, res) => { //requires auth ?
    try {
        const io = req.app.get('io');
        const { board_id, task_id } = req.params;

        const result = await pool.query(
            `DELETE FROM task 
            WHERE task_id = $1 
            AND board_id = $2 RETURNING *`,
            [task_id, board_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'task is not connected to this board' });
        }
        //kanske inte behövs task i emiten
        emitTaskDeleted(io, board_id, task_id);
        res.status(204).send();
    } catch (error) {
        console.error("error deleting task:", error);
        return res.status(500).json({ error: "Server error" });
    }
})

//edit a task
router.patch('/:task_id', requiresAuth(), async (req, res) => {
    try {
        const io = req.app.get('io');

        const { board_id, task_id } = req.params;
        const { task_name } = req.body;

        if(!task_name) {
            return res.status(400).json({ error: 'Behöver ett nytt namn'})
        }

        const result = await pool.query(
        `UPDATE task SET task_name = $1 WHERE task_id = $2 RETURNING *`,
        [task_name, task_id]
        );

        if(result.rowCount === 0) {
            return res.status(404).json({ error: 'task saknas'});
        }

        emitTaskEdit(io, board_id, result.rows[0]);
        res.status(200).json(result.rows[0]);

    }catch (error) {
        console.error("Error updating task:", error);
        return res.status(500).json({ error: "Server error" });
    }
})


//vi tycker att vi inte behöver patch :)
module.exports = router;
