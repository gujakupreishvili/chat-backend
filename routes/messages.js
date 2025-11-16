const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware")
const {postMessage, fetchMessage} = require("../controllers/messagesController")
const upload = require("../middleware/uploadMiddleware");

router.post("/", authMiddleware, upload.single("image"), postMessage);
router.get("/", authMiddleware, fetchMessage);

module.exports = router;