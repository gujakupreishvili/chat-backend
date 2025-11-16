const { createMessage, getMessages } = require("../models/message")

const postMessage = async (req, res) => {
  try {
    const { text, receiver_id } = req.body;
    const user_id = req.user.id;
    const image_path = req.file ? req.file.filename : null;
    let actualReceiverId = null;
    if (receiver_id !== undefined && receiver_id !== null && receiver_id !== "") {
      actualReceiverId = parseInt(receiver_id);
      if (isNaN(actualReceiverId)) {
        actualReceiverId = null;
      }
    }

    const message = await createMessage(text, user_id, actualReceiverId, image_path);
    const fullMessage = {
      ...message,
      username: req.user.username,
      image_url: image_path
        ? `http://localhost:3001/uploads/${image_path}`
        : null,
    };

    if (actualReceiverId) {
      const receiverSocketId = req.app.locals.userSockets?.[actualReceiverId];
      if (receiverSocketId) {
        req.io.to(receiverSocketId).emit("receive_message", fullMessage);
      }
      const senderSocketId = req.app.locals.userSockets?.[user_id];
      if (senderSocketId) {
        req.io.to(senderSocketId).emit("receive_message", fullMessage);
      }
    } else {
      req.io.emit("receive_message", fullMessage);
    }
    res.json(fullMessage);
  } catch (error) {
    console.error("Message send error:", error);
    res.status(500).json({ 
      error: "Failed to send message",
      details: error.message 
    });
  }
};
const fetchMessage = async (req, res) => {
  try {
    let messages = await getMessages(req.user.id);
    messages = messages.map((m) => ({
      ...m,
      image_url: m.image_path
        ? `http://localhost:3001/uploads/${m.image_path}`
        : null,
    }));
    res.json(messages);
  } catch (error) {
    console.error("fetchMessage error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { postMessage, fetchMessage }