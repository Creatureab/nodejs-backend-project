import mongoose from "mongoose";
import { addCommonVirtuals } from "../helper/mongoose-plugin.js";
import { orderStatuses } from "../constants/order.constants.js";

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

const orderSchema = mongoose.Schema(
  {
    orderItems: [orderItemSchema],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: orderStatuses,
        message:
          'Status must be one of:"processing", "shipped", "delivered", "cancelled',
      },
      default: "pending",
    },
    totalPrice: {
      type: Number,
      required: [true, "total price is required."],
    },
  },
  {
    timestamps: true,
  },
);
// return id property better then the _id
orderSchema.plugin(addCommonVirtuals);

//Calculate total price for order items
orderSchema.methods.calculateTotalPrice = function () {
  return this.orderItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
};

//pre save middleware: automatically before saving annd order document.
orderSchema.pre("save", function () {
  if (this.isModified("orderItems") || !this.totalPrice) {
    this.totalPrice = this.calculateTotalPrice();
  }
});

export const OrderModel = mongoose.model("Order", orderSchema);
