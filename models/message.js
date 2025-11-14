const pool = require("../config/db");

const createMessage = async (text, user_id, receiver_id = null) => {
  const result = await pool.query(
    `INSERT INTO messages (text, user_id, receiver_id) VALUES ($1, $2, $3) RETURNING *`,
    [text, user_id, receiver_id]
  )
  return result.rows[0];
}
const getMessages = async (user_id) => {
  const result = await pool.query(`
    SELECT m.id, m.text, m.user_id, m.receiver_id, u.username, m.created_at
    FROM messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.receiver_id IS NULL OR m.receiver_id = $1 OR m.user_id = $1
    ORDER BY m.created_at ASC
  `, [user_id]);
  return result.rows;
}
module.exports = {createMessage, getMessages}