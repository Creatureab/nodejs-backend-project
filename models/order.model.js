import mongoose from "mongoose";

const orderItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Quantity must be atleast one"],
    max: [999, "Quantity can not be exceed by 999"],
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
  },
});

const orderScehma = mongoose.Schema({
  orderItems: [orderItemSchema],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: {
      values: ["pending", "processing", "shipped", "delivered", "cancelled"],
      message:
        'Status must be one of:"processing", "shipped", "delivered", "cancelled',
    },
    default: "pending",
  },
});
