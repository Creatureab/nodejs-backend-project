import mongoose from "mongoose";
import { addCommonVirtuals } from "../helper/mongoose-plugin.js";

const categorySchema = new mongoose.Schema({
  name: String,
});

categorySchema.plugin(addCommonVirtuals);

export const Category = mongoose.model("Category", categorySchema);
export default Category;
