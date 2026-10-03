import mongoose, { Schema, Document, Model } from "mongoose";
import { IMenuItem, IVariant, IAddOn } from "@/types";

export interface IMenuItemDocument extends Omit<IMenuItem, "_id">, Document {}

const VariantSchema = new Schema<IVariant>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const AddOnSchema = new Schema<IAddOn>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const MenuItemSchema = new Schema<IMenuItemDocument>(
  {
    name: { type: String, required: true, trim: true },
    hindiName: { type: String, default: "" },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    image: { type: String, required: true },
    foodType: { type: String, enum: ["VEG", "NON_VEG", "BEVERAGE"], default: "VEG" },
    basePrice: { type: Number, required: true },
    discountPrice: { type: Number },
    tag: { type: String, default: "" },
    variants: [VariantSchema],
    addOns: [AddOnSchema],
    preparationTime: { type: String, default: "15-20 mins" },
    available: { type: Boolean, default: true, index: true },
    featured: { type: Boolean, default: false },
    popular: { type: Boolean, default: false },
    todaySpecial: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const MenuItem: Model<IMenuItemDocument> =
  mongoose.models.MenuItem || mongoose.model<IMenuItemDocument>("MenuItem", MenuItemSchema);

export default MenuItem;
