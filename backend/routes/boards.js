// Import express so we can create a router just for board-related routes.
const express = require("express");
// Import the shared database pool from db.js.
const { pool } = require("../pool");

const { requiresAuth } = require('express-openid-connect'); //new

//lets boards route hand off requests to subcards
const subcardRouter = require("./subcards");

const { emitUserAdded } = require('../socket_events/board_events');

// Create a router that will hold routes related to boards.
const router = express.Router({ mergeParams: true });

router.use('/:board_id/cards', subcardRouter);

//get all boards
router.get('/', requiresAuth(), async (req, res) => {
  try {
    const email = req.oidc.user.email;
    const user = await pool.query('SELECT * FROM users WHERE user_mail = $1', [email]);

    if (!user.rows[0]) {
      return res.status(404).json({ error: 'Användaren hittades inte' });
    }

    //get all boards from a specific user
    const result = await pool.query(
      `SELECT board.* 
      FROM board
      JOIN user_board ON board.board_id = user_board.board_id 
      WHERE user_board.user_id = $1`,
      [user.rows[0].user_id]);

    return res.status(200).json(result.rows);

  } catch (error) {
    console.error("Error fetching boards:", error);
    res.status(500).json({ error: "Failed to fetch boards" });
  }
})

// Get board by ID
router.get('/:board_id', requiresAuth(), async (req, res) => {
  try {
    const email = req.oidc.user.email;
    const user = await pool.query('SELECT * FROM users WHERE user_mail = $1', [email]);

    if (!user.rows[0]) {
      return res.status(404).json({ error: 'Användaren hittades inte' });
    }

    const user_id = user.rows[0].user_id;
    const { board_id } = req.params;
    
    const connection = await pool.query(
      `SELECT * FROM user_board 
      WHERE user_id = $1 
      AND board_id = $2`,
      [user_id, board_id]);

    if (!connection.rows[0]) {
      return res.status(404).json({ error: 'Ingen koppling?!' });
    }

    const result = await pool.query(
        "SELECT * FROM board WHERE board_id = $1",
        [board_id]
    );

    if (result.rowCount === 0) {
        return res.status(404).json({ error: "Board not found" });
    }

    return res.status(200).json(result.rows[0]);

    } catch (error) {
      console.error("error getting board:", error);
      return res.status(500).json({ error: "Server error" });
    }
})

// Create one new board.
router.post("/", requiresAuth(), async (req, res) => {
  try {
    const email = req.oidc.user.email;
    const user = await pool.query('SELECT * FROM users WHERE user_mail = $1', [email]);

    if (!user.rows[0]) {
      return res.status(404).json({ error: 'Användaren hittades inte' });
    }

    const user_id = user.rows[0].user_id;
    // Read the board name sent from the frontend body.
    const { name, type } = req.body;

    // om typen är group => sant, annars falskt
    const is_shared = type === 'group'

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Insert the new board and ask PostgreSQL to return the inserted row.
    const board = await pool.query(
      "INSERT INTO board (board_name, is_shared) VALUES ($1, $2) RETURNING *",
      [name, is_shared]
    );

    if (!board.rows[0]) {
      return res.status(404).json({ error: 'Board skapas inte' });
    }

    const board_id = board.rows[0].board_id;
    await pool.query(`INSERT INTO user_board (user_id, board_id) VALUES ($1, $2)`, [user_id, board_id]);

    //return the status code that the creation worked and
    //send the created board back to the frontend.
    return res.status(201).json(board.rows[0]);

  } catch (error) {
    // Log the real error in the terminal for debugging.
    console.error("Error creating board:", error);
    // Send a simple error message to the frontend.
    res.status(500).json({ error: "Server error" });
  }
});

//get all boards from a specific user
router.get('/type/:type', requiresAuth(), async (req, res) => {
  try {
    const { type } = req.params;
    //kollar om type är ok!
    if (type !== 'personal' && type !== 'group') {
      return res.status(400).json({ error: "invalid type" });
    }
    //is_shared är en bool, kollar om typen är grupp = sant, annars falskt.
    const is_shared = type === 'group';

    const email = req.oidc.user.email;
    const user = await pool.query('SELECT * FROM users WHERE user_mail = $1', [email]);

    if (!user.rows[0]) {
      return res.status(404).json({ error: 'Användaren hittades inte' });
    }

    //använder is_shared i databasen för att hämta delade eller inte
    const result = await pool.query(
      `SELECT board.* 
      FROM board
      JOIN user_board ON board.board_id = user_board.board_id 
      WHERE user_board.user_id = $1
      AND board.is_shared = $2`,
      [user.rows[0].user_id, is_shared]);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching group boards:", error);
    res.status(500).json({ error: "Failed to fetch boards" });
  }
})


//delete board by id
router.delete('/:board_id', requiresAuth(), async (req, res) => {
  try {
    const email = req.oidc.user.email;
    const user = await pool.query('SELECT * FROM users WHERE user_mail = $1', [email]);

    if (!user.rows[0]) {
      return res.status(404).json({ error: 'Användaren hittades inte' });
    }

    const user_id = user.rows[0].user_id;
    const { board_id } = req.params;
    
    const connection = await pool.query(
      `SELECT * FROM user_board 
      WHERE user_id = $1 
      AND board_id = $2`,
      [user_id, board_id]);

    if (!connection.rows[0]) {
      return res.status(404).json({ error: 'Ingen koppling?!' });
    }

    //ta bort kopplingen mellan user och board
    await pool.query(`DELETE FROM user_board WHERE board_id = $1`, [board_id]);

    //ta bort board
    const result = await pool.query("DELETE FROM board WHERE board_id = $1", [board_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "result not found" });
    }

    res.status(204).send();

  } catch (error) {
    console.error("error deleting board:", error);
    return res.status(500).json({ error: "Server error" });
  }
})

// router.patch();

router.post('/:board_id/share', requiresAuth(), async (req, res) => {
  try{
      const io = req.app.get('io');
      //behöver man göra någon auth check för dethär?
      const { new_user_mail } = req.body;
      const { board_id } = req.params;

      //kollar authentication för user som lägger till
      const requesting_user = await pool.query(
        'SELECT * FROM users WHERE user_mail = $1',
        [req.oidc.user.email]
      );

      //om requesting user inte finns
      if(!requesting_user.rows[0]) {
        return res.status(404).json({ error: 'Requesting user not found'})
      }

      //kollar om usern man ska lägga till finns
      const user_to_add = await pool.query(
        'SELECT * FROM users WHERE user_mail = $1',
        [new_user_mail]
      )

      //om den nya usern inte finns
      if(!user_to_add.rows[0]) {
        return res.status(404).json({ error: 'Requested user not found'})
      }

      //kollar om requesting user har tillgång till boarden
      const membership = await pool.query(
        'SELECT * FROM user_board WHERE user_id = $1 AND board_id = $2',
        [requesting_user.rows[0].user_id, board_id]
      )

      //om requesting user inte har tillgång (men tror den alltid kommer ha det)
      if (!membership.rows[0]) {
        return res.status(403).json({ error: 'You don`t have access to this board'})
      }

      //kollar om den nya usern redan är med
      const alreadyMember = await pool.query(
          'SELECT * FROM user_board WHERE user_id = $1 AND board_id = $2',
          [user_to_add.rows[0].user_id, board_id]
      );

      //om den nya usern redan är med
      if (alreadyMember.rows[0]) {
          return res.status(409).json({ error: 'This user already has access to this board' });
      }

      //updaterar borden till is_shared = true om den inte redan är det
      await pool.query(
          'UPDATE board SET is_shared = true WHERE board_id = $1 AND is_shared = false',
          [board_id]
      );

      //lägger till den nya usern
      const result = await pool.query(
        `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2) RETURNING *`, 
        [user_to_add.rows[0].user_id, board_id]
      )

      // om det ska updateras i real time när någon delar med en
      // hur ska det funka med rum o sånt?
      emitUserAdded(io, board_id, result.rows[0]);
      return res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error("error deleting board:", error);
    return res.status(500).json({ error: "Server error" });
  }
})

// Export the router so app.js can mount it.
module.exports = router;
