import mongoose, { Schema, Document, Model } from "mongoose";
import { IReview } from "@/types";

export interface IReviewDocument extends Omit<IReview, "_id">, Document {}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User" },
    order: { type: Schema.Types.ObjectId, ref: "Order" },
    name: { type: String, required: true, trim: true },
    roleTitle: { type: String, default: "Regular Guest" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    approved: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const Review: Model<IReviewDocument> =
  mongoose.models.Review || mongoose.model<IReviewDocument>("Review", ReviewSchema);

export default Review;
