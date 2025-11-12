const express = require("express");
const router = express.Router();
const { register ,getUserById , login} = require("../controllers/authController");

router.post("/register", register);
router.get("/getUserById/:id", getUserById )
router.post("/login", login);

module.exports = router;