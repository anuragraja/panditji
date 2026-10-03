import mongoose, { Schema, Document, Model } from "mongoose";
import { IBooking } from "@/types";

export interface IBookingDocument extends Omit<IBooking, "_id">, Document {}

const BookingSchema = new Schema<IBookingDocument>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, default: "Lunch / Dinner" },
    guests: { type: String, required: true },
    specialRequest: { type: String, default: "" },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "REJECTED", "COMPLETED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
  },
  { timestamps: true }
);

export const Booking: Model<IBookingDocument> =
  mongoose.models.Booking || mongoose.model<IBookingDocument>("Booking", BookingSchema);

export default Booking;
