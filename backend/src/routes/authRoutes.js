const express = require("express");
const router = express.Router();

const { register, login, logout } = require("../controllers/authController");
const { registerLimiter, loginLimiter } = require("../middlewares/rateLimit");

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/logout", loginLimiter, logout);


module.exports = router;