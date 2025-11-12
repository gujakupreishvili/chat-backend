const pool = require("../config/db");
const bcrypt = require("bcryptjs");

const createUser = async (username, password, email) => {
  const hash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (username, password_hash, email)
     VALUES ($1, $2, $3)
     RETURNING id, username, email`,
    [username, hash, email]
  );
  return result.rows[0];
};

const findUserById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0];
};

module.exports = { createUser, findUserById };
