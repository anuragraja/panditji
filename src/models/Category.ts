import mongoose, { Schema, Document, Model } from "mongoose";
import { ICategory } from "@/types";

export interface ICategoryDocument extends Omit<ICategory, "_id">, Document {}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    hindiName: { type: String, default: "" },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Category: Model<ICategoryDocument> =
  mongoose.models.Category || mongoose.model<ICategoryDocument>("Category", CategorySchema);

export default Category;
