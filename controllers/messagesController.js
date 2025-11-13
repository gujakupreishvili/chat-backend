const { createMessage, getMessages } = require("../models/message")

const postMessage = async (req, res) => {
  const { text, reciver_id } = req.body
  const user_id = req.user.id
  if (!text) return res.status(400).json({ error: "Message text required" })

  try {
    const message = await createMessage(text, user_id, reciver_id)
    res.status(201).json(message);
  } catch (error) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}

const fetchMessage = async (req, res) => {
  try {
    const message = await getMessages(req.user.id)
    res.json(message)
  } catch (error) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
module.exports = {postMessage, fetchMessage}