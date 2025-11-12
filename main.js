const express = require("express")
const pool = require("./config/db");
const authRoutes = require("./routes/auth");
//  const multer = require("multer")

const app = express()
app.use(express.json())

app.use("/api/auth", authRoutes);

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()")
    res.json({ message: "Hello World", dbTime: result.rows[0].now });
  } catch (error) {
    console.error("DB ERROR:", error);
    res.status(500).json({ error: "Database error" });
    
  }
})
 
app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
})