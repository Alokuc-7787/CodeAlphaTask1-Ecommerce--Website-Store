const express = require("express");
const {
  createContactMessage,
  getContactMessages,
} = require("../controllers/contactController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", createContactMessage);
router.get("/messages", protect, getContactMessages);

module.exports = router;
