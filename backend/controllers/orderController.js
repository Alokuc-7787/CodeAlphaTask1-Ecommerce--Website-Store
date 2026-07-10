const Order = require("../models/Order");

const removeDeliveredOrders = async (userId) => {
  const now = new Date();

  await Order.deleteMany({
    userId,
    $or: [
      { estimatedDelivery: { $lte: now } },
      { orderStatus: "Delivered" },
    ],
  });
};

const getUserOrders = async (req, res, next) => {
  try {
    await removeDeliveredOrders(req.user._id);

    const orders = await Order.find({
      userId: req.user._id,
      estimatedDelivery: { $gt: new Date() },
      orderStatus: { $ne: "Delivered" },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserOrders,
};
