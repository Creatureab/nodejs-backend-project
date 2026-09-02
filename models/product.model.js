import mongoose from "mongoose";
import { addCommonVirtuals } from "../helper/mongoose-plugin.js";

const productSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product name is required"],
      trim: true, //iphone 15
      minLength: [2, "Product name musrt be at least 2 characters"],
      maxLength: [100, "Product name cannot exceed 100 characters"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Category is required"],
      ref: "Category",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negitive here"],
    },
    description: {
      type: String,
      required: [true, "Description required."],
      trim: true,
      minLength: [5, "Description must be at least 5 characters"],
      maxLength: [100, "Description cannot exceed 100 characters"],
    },
    images: {
      type: [String],
      required: [true, "at least one image is required"],
    },
    countInStock: {
      type: Number,
      required: [true, "Stock count required"],
      min: [0, "Stock count connot be negitive"],
      max: [99999, "stock count cannot exceed 99999"],
      default: 0,
    },
    rating: {
      average: {
        type: Number,
        default: 5,
        min: [1, "Rating cannot be less than 1 star"],
        max: [5, "Rating cannot 5 stars"],
      },
      count: {
        type: Number,
        default: 0,
        min: [0, "Rating count cannot be negitive"],
      },
    },
    views: {
      type: Number,
      default: 0,
      min: [0, "Views Cannot be negitive"],
    },
  },
  {
    timestamps: true,
  },
);

productSchema.plugin(addCommonVirtuals);

export const ProductModel = mongoose.model("Product", productSchema);
