const express = require("express");
const { getUserOrders, removeOrder } = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getUserOrders);
router.delete("/:id", protect, removeOrder);

module.exports = router;
