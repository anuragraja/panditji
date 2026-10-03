import mongoose, { Schema, Document, Model } from "mongoose";
import { IOrder, IOrderItem, IStatusHistory } from "@/types";

export interface IOrderDocument extends Omit<IOrder, "_id">, Document {}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    menuItemId: { type: String, required: true },
    name: { type: String, required: true },
    hindiName: { type: String },
    image: { type: String },
    foodType: { type: String, enum: ["VEG", "NON_VEG", "BEVERAGE"], default: "VEG" },
    selectedVariant: {
      name: { type: String },
      price: { type: Number },
    },
    selectedAddOns: [
      {
        name: { type: String },
        price: { type: Number },
      },
    ],
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true },
    specialInstructions: { type: String, default: "" },
  },
  { _id: false }
);

const StatusHistorySchema = new Schema<IStatusHistory>(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: "User" },
    customerSnapshot: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
    },
    items: [OrderItemSchema],
    orderType: { type: String, enum: ["DELIVERY", "PICKUP"], default: "DELIVERY" },
    deliveryAddressSnapshot: {
      houseNumber: { type: String },
      street: { type: String },
      landmark: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponDiscount: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    coupon: { type: String },
    paymentMethod: { type: String, enum: ["COD", "UPI", "RAZORPAY"], default: "COD" },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
      index: true,
    },
    orderStatus: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "PREPARING",
        "READY",
        "READY_FOR_PICKUP",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "PENDING",
      index: true,
    },
    notes: { type: String, default: "" },
    statusHistory: [StatusHistorySchema],
    whatsappSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Order: Model<IOrderDocument> =
  mongoose.models.Order || mongoose.model<IOrderDocument>("Order", OrderSchema);

export default Order;
