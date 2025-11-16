const express = require("express");
const http = require("http");
const cors = require("cors");
const pool = require("./config/db");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const { Server } = require("socket.io");
const socketMiddleware = require("./middleware/socketMiddleware");

const app = express();

app.use(express.json());

app.use(cors({
  origin: ["http://localhost:5173", "https://chat-frontend-chi-vert.vercel.app"],
  credentials: true,
}));

const onlineUsers = new Map(); 
app.locals.userSockets = {};

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/uploads", express.static("uploads"));

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "Hello World", dbTime: result.rows[0].now });
  } catch (error) {
    console.error("DB ERROR:", error);
    res.status(500).json({ error: "Database error" });
  }
});

io.use(socketMiddleware);

io.on("connection", (socket) => {
  console.log(`${socket.user.username} connected, socketId: ${socket.id}`);
  
  onlineUsers.set(socket.user.id, socket.id);
  app.locals.userSockets[socket.user.id] = socket.id;

  io.emit("online_users", Array.from(onlineUsers.keys()));

  socket.on("send_message", async (data) => {
    try {
      const { text, receiver_id = null } = data;
      const sender_id = socket.user.id;
  
      const { createMessage } = require("./models/message");
      const message = await createMessage(text, sender_id, receiver_id);

      const fullMessage = {
        ...message,
        username: socket.user.username,
        image_url: message.image_path 
        ? `http://localhost:3001/uploads/${message.image_path}`
        : null
      };
  
      if (receiver_id) {
        const receiverSocket = onlineUsers.get(receiver_id);
        if (receiverSocket) {
          io.to(receiverSocket).emit("receive_message", fullMessage);
        }
        io.to(socket.id).emit("receive_message", fullMessage);
      } else {
        io.emit("receive_message", fullMessage);
      }
  
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("disconnect", () => {
    console.log(`${socket.user.username} disconnected`);
    onlineUsers.delete(socket.user.id);
    delete app.locals.userSockets[socket.user.id]; 
    io.emit("online_users", Array.from(onlineUsers.keys()));
  });
});

server.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});