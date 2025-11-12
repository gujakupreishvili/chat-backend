const pool = require("../config/db");

(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
      );
    `);
    console.log(" Users table created or already exists");
    process.exit(0);
  } catch (err) {
    console.error("DB Initialization Error:", err);
    process.exit(1);
  }
})();
