import mongoose, { Schema, Document, Model } from "mongoose";
import { IUser, IUserAddress } from "@/types";

export interface IUserDocument extends Omit<IUser, "_id">, Document {}

const UserAddressSchema = new Schema<IUserAddress>(
  {
    label: { type: String, default: "Home" },
    houseNumber: { type: String, required: true },
    street: { type: String, required: true },
    landmark: { type: String, default: "" },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, index: true },
    phone: { type: String, required: true, unique: true, index: true, trim: true },
    passwordHash: { type: String },
    role: { type: String, enum: ["CUSTOMER", "ADMIN"], default: "CUSTOMER", required: true },
    addresses: [UserAddressSchema],
  },
  { timestamps: true }
);

export const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);

export default User;
