const Razorpay = require("razorpay");

const getRazorpayClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    const error = new Error("Razorpay keys are missing in backend .env");
    error.statusCode = 500;
    throw error;
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

const createOrder = async (req, res) => {
  try {
    const { amount, productId, productName } = req.body;
    const razorpay = getRazorpayClient();
    const isTestMode = process.env.RAZORPAY_KEY_ID.startsWith("rzp_test_");

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        productId: productId ? String(productId) : "",
        productName: productName || "",
      },
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      isTestMode,
    });
  } catch (error) {
    console.log("Razorpay order error:", error);

    return res.status(500).json({
      success: false,
      message: "Payment order failed",
      error: error.message,
    });
  }
};

module.exports = { createOrder };
