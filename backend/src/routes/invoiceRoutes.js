const express = require("express");
const router = express.Router();

const invoiceController = require("../controllers/invoiceController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, invoiceController.createInvoice);
router.get("/", authMiddleware, invoiceController.getInvoices);
router.put("/:id", authMiddleware, invoiceController.updateInvoice);
router.get("/suggested", authMiddleware, invoiceController.getSuggestedInvoice);
router.delete("/:id", authMiddleware, invoiceController.deleteInvoice);

module.exports = router;