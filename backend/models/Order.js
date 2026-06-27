const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const shippingDetailsSchema = new mongoose.Schema(
  {
    fullName: String,
    phone: String,
    pincode: String,
    address: String,
    city: String,
    state: String,
    paymentMethod: String,
    paymentDetails: {
      provider: String,
      paymentId: String,
      orderId: String,
      signature: String,
      status: String,
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingDetails: {
      type: shippingDetailsSchema,
      required: true,
    },
    orderStatus: {
      type: String,
      default: "Processing",
    },
    estimatedDelivery: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Order", orderSchema);
