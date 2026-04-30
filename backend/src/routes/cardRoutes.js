const express = require("express");
const router = express.Router();

const cardController = require("../controllers/cardController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, cardController.createCard);
router.get("/", authMiddleware, cardController.getCards);
router.delete("/:id", authMiddleware, cardController.deleteCard);

module.exports = router;