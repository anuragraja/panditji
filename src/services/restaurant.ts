import { connectToDatabase } from "@/lib/db/mongodb";
import {
  MenuItem,
  Category,
  RestaurantSettings,
  Review,
} from "@/models";
import { IMenuItem, ICategory, IRestaurantSettings, IReview } from "@/types";

export const fallbackDishes: IMenuItem[] = [];

export const fallbackCategories: ICategory[] = [
  { _id: "c-1", name: "Main Course", hindiName: "मुख्य व्यंजन", slug: "main-course", displayOrder: 1, isActive: true },
  { _id: "c-2", name: "Breads", hindiName: "रोटियां व नान", slug: "breads", displayOrder: 2, isActive: true },
  { _id: "c-3", name: "Rice", hindiName: "चावल व बिरयानी", slug: "rice", displayOrder: 3, isActive: true },
  { _id: "c-4", name: "Drinks", hindiName: "पेय पदार्थ", slug: "drinks", displayOrder: 4, isActive: true },
  { _id: "c-5", name: "Combos", hindiName: "थाली व कॉम्बो", slug: "combos", displayOrder: 5, isActive: true },
  { _id: "c-6", name: "Desserts", hindiName: "मीठा", slug: "desserts", displayOrder: 6, isActive: true },
  { _id: "c-7", name: "Snacks", hindiName: "नाश्ता", slug: "snacks", displayOrder: 7, isActive: true },
];

export const fallbackSettings: IRestaurantSettings = {
  restaurantName: "Panditji Restaurant",
  tagline: "घर का स्वाद",
  logo: "",
  phone: "+91 86430 10994",
  whatsappNumber: "918643010994",
  whatsappOrdersEnabled: true,
  email: "contact@panditjirestaurant.com",
  address: "Khajurikala, Bhopal, Madhya Pradesh 462022",
  googleMapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Panditji+Restaurant+Khajurikala+Bhopal+Madhya+Pradesh+462022",
  openingHours: "11:00 AM – 11:00 PM • Every Day",
  acceptOrders: true,
  deliveryEnabled: true,
  pickupEnabled: true,
  minOrderAmount: 150,
  deliveryFee: 30,
  freeDeliveryAbove: 499,
  estimatedDeliveryTime: "30-45 mins",
  taxEnabled: false,
  taxPercentage: 5,
  codEnabled: true,
  upiEnabled: true,
  upiId: "panditji@upi",
  onlinePaymentEnabled: true,
  heroHeading: "Desi Swad.<br><em>Apno Wali Feeling.</em>",
  heroSubtitle:
    "Fresh ingredients, traditional recipes and the warmth of a true Indian dhaba — served fresh to your table.",
  heroImage:
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1900&q=88",
  announcementBanner: {
    enabled: false,
    text: "",
  },
};

export async function getDishes(): Promise<IMenuItem[]> {
  try {
    await connectToDatabase();
    const items = await MenuItem.find({ available: true }).sort({ createdAt: -1 }).lean();
    if (items && items.length > 0) {
      return JSON.parse(JSON.stringify(items));
    }
    return [];
  } catch (e) {
    console.error("Error fetching dishes from MongoDB:", e);
    return [];
  }
}

export async function getCategories(): Promise<ICategory[]> {
  try {
    await connectToDatabase();
    const cats = await Category.find({ isActive: true }).sort({ displayOrder: 1 }).lean();
    if (cats && cats.length > 0) {
      return JSON.parse(JSON.stringify(cats));
    }
    return fallbackCategories;
  } catch (e) {
    console.error("Error fetching categories, using fallback:", e);
    return fallbackCategories;
  }
}

export async function getSettings(): Promise<IRestaurantSettings> {
  try {
    await connectToDatabase();
    const settings = await RestaurantSettings.findOne().lean();
    if (settings) {
      const parsed = JSON.parse(JSON.stringify(settings));
      if (!parsed.address || parsed.address.includes("Main Road")) {
        parsed.address = "Khajurikala, Bhopal, Madhya Pradesh 462022";
      }
      if (!parsed.phone || parsed.phone.includes("90000") || parsed.phone.includes("6268")) {
        parsed.phone = "+91 86430 10994";
      }
      if (!parsed.whatsappNumber || parsed.whatsappNumber.includes("90000") || parsed.whatsappNumber.includes("6268")) {
        parsed.whatsappNumber = "918643010994";
      }
      return parsed;
    }
    return fallbackSettings;
  } catch (e) {
    console.error("Error fetching settings, using fallback:", e);
    return fallbackSettings;
  }
}

export async function getApprovedReviews(): Promise<IReview[]> {
  try {
    await connectToDatabase();
    const reviews = await Review.find({ approved: true }).sort({ createdAt: -1 }).limit(9).lean();
    if (reviews && reviews.length > 0) {
      return JSON.parse(JSON.stringify(reviews));
    }
    return [];
  } catch (e) {
    console.error("Error fetching reviews:", e);
    return [];
  }
}
