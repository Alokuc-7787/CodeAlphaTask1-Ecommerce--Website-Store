const Order = require("../models/Order");

const getAdminEmails = () =>
  (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "alokuc123@gmail.com")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

const isOrderAdmin = (user) => {
  const userEmail = String(user?.email || "").toLowerCase();
  return getAdminEmails().includes(userEmail);
};

const getVisibleOrderStatus = (order) => {
  if (order.orderStatus === "Delivered") {
    return "Delivered";
  }

  if (!order.estimatedDelivery) {
    return order.orderStatus || "Confirmed";
  }

  const now = new Date();
  const deliveryDate = new Date(order.estimatedDelivery);

  if (!Number.isNaN(deliveryDate.getTime()) && deliveryDate <= now) {
    return "Delivered";
  }

  return order.orderStatus || "Confirmed";
};

const mapOrderForResponse = (order) => {
  const data = order.toObject();
  data.displayStatus = getVisibleOrderStatus(data);
  return data;
};

const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      canManageOrders: isOrderAdmin(req.user),
      orders: orders.map(mapOrderForResponse),
    });
  } catch (error) {
    next(error);
  }
};

const removeOrder = async (req, res, next) => {
  try {
    if (!isOrderAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only admin can remove delivered orders",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const status = getVisibleOrderStatus(order);

    if (status !== "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Only delivered orders can be removed",
      });
    }

    await order.deleteOne();

    const orders = await Order.find({ userId: order.userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Delivered order removed",
      canManageOrders: true,
      orders: orders.map(mapOrderForResponse),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserOrders,
  removeOrder,
};
