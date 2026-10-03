import mongoose, { Schema, Document, Model } from "mongoose";
import { IRestaurantSettings } from "@/types";

export interface IRestaurantSettingsDocument
  extends Omit<IRestaurantSettings, "_id">,
    Document {}

const RestaurantSettingsSchema = new Schema<IRestaurantSettingsDocument>(
  {
    restaurantName: { type: String, default: "Pandit Ji Ka Dhaba" },
    tagline: { type: String, default: "घर का स्वाद" },
    logo: { type: String, default: "" },
    phone: { type: String, default: "+91 90000 00000" },
    whatsappNumber: { type: String, default: "919000000000" },
    whatsappOrdersEnabled: { type: Boolean, default: true },
    email: { type: String, default: "contact@panditjikadhaba.com" },
    address: { type: String, default: "Main Road, Bhopal, Madhya Pradesh" },
    googleMapsUrl: { type: String, default: "https://maps.google.com" },
    openingHours: { type: String, default: "11:00 AM – 11:00 PM • Every Day" },
    socialLinks: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
    acceptOrders: { type: Boolean, default: true },
    deliveryEnabled: { type: Boolean, default: true },
    pickupEnabled: { type: Boolean, default: true },
    minOrderAmount: { type: Number, default: 150 },
    deliveryFee: { type: Number, default: 30 },
    freeDeliveryAbove: { type: Number, default: 499 },
    estimatedDeliveryTime: { type: String, default: "30-45 mins" },
    taxEnabled: { type: Boolean, default: false },
    taxPercentage: { type: Number, default: 5 },
    codEnabled: { type: Boolean, default: true },
    upiEnabled: { type: Boolean, default: true },
    upiId: { type: String, default: "panditji@upi" },
    onlinePaymentEnabled: { type: Boolean, default: true },
    heroHeading: { type: String, default: "Desi Swad.<br><em>Apno Wali Feeling.</em>" },
    heroSubtitle: {
      type: String,
      default:
        "Fresh ingredients, traditional recipes and the warmth of a true Indian dhaba — served fresh to your table.",
    },
    heroImage: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1900&q=88",
    },
    announcementBanner: {
      enabled: { type: Boolean, default: false },
      text: { type: String, default: "Welcome to Pandit Ji Ka Dhaba! Free delivery on orders above ₹499." },
    },
    whatsappTemplates: {
      confirmed: {
        type: String,
        default: "Namaste {customerName}! Your order #{orderNumber} has been CONFIRMED by Pandit Ji Ka Dhaba. We are preparing it fresh for you!",
      },
      preparing: {
        type: String,
        default: "Namaste {customerName}! Your order #{orderNumber} is now PREPARING with desi ghee and love. 🍛",
      },
      ready: {
        type: String,
        default: "Namaste {customerName}! Your order #{orderNumber} is READY!",
      },
      outForDelivery: {
        type: String,
        default: "Namaste {customerName}! Your order #{orderNumber} is OUT FOR DELIVERY and on its way to your address. 🛵",
      },
      delivered: {
        type: String,
        default: "Namaste {customerName}! Your order #{orderNumber} has been DELIVERED. Enjoy the authentic desi swad! घर का स्वाद ❤️",
      },
      cancelled: {
        type: String,
        default: "Namaste {customerName}! Your order #{orderNumber} has been cancelled. Please contact us for any query.",
      },
    },
  },
  { timestamps: true }
);

export const RestaurantSettings: Model<IRestaurantSettingsDocument> =
  mongoose.models.RestaurantSettings ||
  mongoose.model<IRestaurantSettingsDocument>("RestaurantSettings", RestaurantSettingsSchema);

export default RestaurantSettings;
