const express = require("express")
const http = require("http")
const pool = require("./config/db");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages")
const { Server } = require("socket.io");
const socketMiddleware = require("./middleware/socketMiddleware")

const app = express()
app.use(express.json())
const server = http.createServer(app)

const io = new Server(server, {
  cors: { origin: "*" } 
});

io.use(socketMiddleware)

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`${socket.user.username} connected, socketId: ${socket.id}`);
  onlineUsers.set(socket.user.id, socket.id);

  io.emit("online_users", Array.from(onlineUsers.keys()));

  socket.on("send_message", async (data) => {
    try {
      const { text, receiver_id = null } = data;
      const { id: sender_id } = socket.user;

      const { createMessage } = require("./models/message");
      const message = await createMessage(text, sender_id, receiver_id);

      if (receiver_id) {
        const receiverSocket = onlineUsers.get(receiver_id);
        if (receiverSocket) {
          io.to(receiverSocket).emit("receive_message", message);
        }
        socket.emit("receive_message", message);
      } else {
        io.emit("receive_message", message);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("disconnect", () => {
    console.log(`${socket.user.username} disconnected`);
    onlineUsers.delete(socket.user.id);
    io.emit("online_users", Array.from(onlineUsers.keys()));
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()")
    res.json({ message: "Hello World", dbTime: result.rows[0].now });
  } catch (error) {
    console.error("DB ERROR:", error);
    res.status(500).json({ error: "Database error" });
  }
})
 
server.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
})