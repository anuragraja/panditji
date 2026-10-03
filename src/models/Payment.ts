import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPaymentDocument extends Document {
  orderId: mongoose.Types.ObjectId;
  orderNumber: string;
  paymentId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  method: "COD" | "UPI" | "RAZORPAY";
  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  webhookEvent?: string;
  webhookPayload?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPaymentDocument>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    orderNumber: { type: String, required: true, index: true },
    paymentId: { type: String },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    method: { type: String, enum: ["COD", "UPI", "RAZORPAY"], required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
      index: true,
    },
    webhookEvent: { type: String },
    webhookPayload: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Payment: Model<IPaymentDocument> =
  mongoose.models.Payment || mongoose.model<IPaymentDocument>("Payment", PaymentSchema);

export default Payment;
