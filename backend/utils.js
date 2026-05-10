const pool = require('./pool');

async function canUserAccessBoard(userId, boardId) {
  const result = await pool.query(
    `
    SELECT 1
    FROM user_boards
    WHERE user_id = $1
      AND board_id = $2
    `,
    [userId, boardId]
  );

  return result.rows.length > 0;
}

module.export = { canUserAccessBoard };