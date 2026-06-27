const express = require("express");

const {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  getUserCart,
  checkoutCart,
  buyNow,
} = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getUserCart);
router.post("/add", protect, addToCart);
router.put("/quantity", protect, updateCartQuantity);
router.post("/checkout", protect, checkoutCart);
router.post("/buy-now", protect, buyNow);
router.post("/remove", protect, removeFromCart);
router.delete("/remove", protect, removeFromCart);

module.exports = router;
