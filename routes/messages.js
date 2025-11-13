const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware")
const {postMessage, fetchMessage} = require("../controllers/messagesController")

router.post("/", authMiddleware, postMessage);
router.get("/", authMiddleware, fetchMessage);

module.exports = router;