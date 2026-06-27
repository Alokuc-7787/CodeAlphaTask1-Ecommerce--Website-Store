const mongoose = require("mongoose");

const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");

const validateShippingDetails = (details = {}) => {
  const requiredFields = [
    "fullName",
    "phone",
    "pincode",
    "address",
    "city",
    "state",
    "paymentMethod",
  ];

  for (const field of requiredFields) {
    if (!String(details[field] || "").trim()) {
      return `${field} is required`;
    }
  }

  if (!/^\d{10}$/.test(String(details.phone).trim())) {
    return "Phone must be 10 digits";
  }

  if (!/^\d{6}$/.test(String(details.pincode).trim())) {
    return "Pincode must be 6 digits";
  }

  return null;
};

const getEstimatedDeliveryDate = () => {
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  return deliveryDate;
};

const createOrderNumber = () =>
  `EZM-${Date.now()}${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`;

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({
      userId,
      products: [],
    });
  }

  return cart;
};

const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const parsedQuantity = Number(quantity);

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product id is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product id" });
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be a positive integer" });
    }

    const productExists = await Product.findById(productId);

    if (!productExists) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const cart = await getOrCreateCart(req.user._id);
    const existingItem = cart.products.find((item) => item.product.toString() === productId);

    if (existingItem) {
      existingItem.quantity += parsedQuantity;
    } else {
      cart.products.push({ product: productId, quantity: parsedQuantity });
    }

    await cart.save();
    await cart.populate("products.product");

    res.status(200).json({ success: true, message: "Product added to cart", cart });
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product id is required" });
    }

    const cart = await getOrCreateCart(req.user._id);
    cart.products = cart.products.filter((item) => item.product.toString() !== productId);

    await cart.save();
    await cart.populate("products.product");

    res.status(200).json({ success: true, message: "Product removed from cart", cart });
  } catch (error) {
    next(error);
  }
};

const updateCartQuantity = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const parsedQuantity = Number(quantity);

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product id is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product id" });
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    const cart = await getOrCreateCart(req.user._id);
    const existingItem = cart.products.find((item) => item.product.toString() === productId);

    if (!existingItem) {
      return res.status(404).json({ success: false, message: "Product not found in cart" });
    }

    existingItem.quantity = parsedQuantity;
    await cart.save();
    await cart.populate("products.product");

    res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      cart,
    });
  } catch (error) {
    next(error);
  }
};

const getUserCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    await cart.populate("products.product");

    res.status(200).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

const checkoutCart = async (req, res, next) => {
  try {
    const validationError = validateShippingDetails(req.body.shippingDetails);

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const cart = await getOrCreateCart(req.user._id);
    await cart.populate("products.product");

    if (!cart.products.length) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const totalAmount = cart.products.reduce((sum, item) => {
      const productPrice = item.product?.price || 0;
      return sum + productPrice * item.quantity;
    }, 0);

    const purchasedItems = cart.products.map((item) => ({
      productId: item.product?._id,
      name: item.product?.name,
      quantity: item.quantity,
      price: item.product?.price || 0,
    }));

    const order = await Order.create({
      userId: req.user._id,
      orderNumber: createOrderNumber(),
      items: purchasedItems,
      totalAmount,
      shippingDetails: req.body.shippingDetails,
      orderStatus: "Confirmed",
      estimatedDelivery: getEstimatedDeliveryDate(),
    });

    cart.products = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Order placed successfully",
      order,
      cart,
    });
  } catch (error) {
    next(error);
  }
};

const buyNow = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const parsedQuantity = Number(quantity);
    const validationError = validateShippingDetails(req.body.shippingDetails);

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product id is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product id" });
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be a positive integer" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const order = await Order.create({
      userId: req.user._id,
      orderNumber: createOrderNumber(),
      items: [
        {
          productId: product._id,
          name: product.name,
          quantity: parsedQuantity,
          price: product.price,
        },
      ],
      totalAmount: product.price * parsedQuantity,
      shippingDetails: req.body.shippingDetails,
      orderStatus: "Confirmed",
      estimatedDelivery: getEstimatedDeliveryDate(),
    });

    res.status(200).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  getUserCart,
  checkoutCart,
  buyNow,
};
