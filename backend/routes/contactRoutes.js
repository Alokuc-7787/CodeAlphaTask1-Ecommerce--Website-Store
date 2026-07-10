const express = require("express");
const {
  createContactMessage,
  getContactMessages,
  removeContactMessage,
} = require("../controllers/contactController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", createContactMessage);
router.get("/messages", protect, getContactMessages);
router.delete("/messages/:id", protect, removeContactMessage);

module.exports = router;
