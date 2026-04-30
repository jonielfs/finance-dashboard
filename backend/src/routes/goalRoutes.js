const express = require("express");
const router = express.Router();

const goalController = require("../controllers/goalController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, goalController.setGoal);
router.get("/", authMiddleware, goalController.getGoal);

module.exports = router;