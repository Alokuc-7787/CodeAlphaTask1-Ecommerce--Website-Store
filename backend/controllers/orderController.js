const Order = require("../models/Order");

const getUserOrders = async (req, res, next) => {
  try {
    const now = new Date();

    await Order.deleteMany({
      userId: req.user._id,
      estimatedDelivery: { $lt: now },
    });

    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });

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
