const express = require("express");

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/* GET all products */
router.get("/", getProducts);

/* GET single product */
router.get("/:id", getProductById);

/* CREATE product (Admin / Protected) */
router.post("/", protect, createProduct);

/* UPDATE product */
router.put("/:id", protect, updateProduct);

/* DELETE product */
router.delete("/:id", protect, deleteProduct);

module.exports = router;