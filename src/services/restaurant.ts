import { connectToDatabase } from "@/lib/db/mongodb";
import {
  MenuItem,
  Category,
  RestaurantSettings,
  Review,
} from "@/models";
import { IMenuItem, ICategory, IRestaurantSettings, IReview } from "@/types";

export const fallbackDishes: IMenuItem[] = [
  {
    _id: "paneer-1",
    name: "Paneer Butter Masala",
    hindiName: "पनीर बटर मसाला",
    slug: "paneer-butter-masala",
    category: "Main Course",
    basePrice: 220,
    tag: "POPULAR",
    description: "Soft paneer in a rich tomato-butter gravy.",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=85",
    foodType: "VEG",
    preparationTime: "15-20 mins",
    available: true,
    popular: true,
    featured: true,
    todaySpecial: false,
    variants: [
      { name: "Half", price: 130 },
      { name: "Full", price: 220 },
    ],
    addOns: [
      { name: "Extra Butter", price: 25 },
      { name: "Extra Paneer Cubes", price: 45 },
    ],
  },
  {
    _id: "dal-2",
    name: "Dal Tadka",
    hindiName: "दाल तड़का",
    slug: "dal-tadka",
    category: "Main Course",
    basePrice: 160,
    tag: "CLASSIC",
    description: "Yellow dal finished with ghee and Indian spices.",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=85",
    foodType: "VEG",
    preparationTime: "15-20 mins",
    available: true,
    popular: true,
    featured: false,
    todaySpecial: false,
    variants: [
      { name: "Half", price: 95 },
      { name: "Full", price: 160 },
    ],
    addOns: [{ name: "Extra Desi Ghee", price: 30 }],
  },
  {
    _id: "chole-3",
    name: "Amritsari Chole",
    hindiName: "अमृतसरी छोले",
    slug: "amritsari-chole",
    category: "Main Course",
    basePrice: 170,
    tag: "CHEF'S PICK",
    description: "Punjabi chickpeas cooked in a bold masala.",
    image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=900&q=85",
    foodType: "VEG",
    preparationTime: "15-20 mins",
    available: true,
    popular: true,
    featured: true,
    todaySpecial: false,
    variants: [
      { name: "Half", price: 105 },
      { name: "Full", price: 170 },
    ],
    addOns: [{ name: "Extra Bhatura", price: 40 }],
  },
  {
    _id: "roti-4",
    name: "Tandoori Roti",
    hindiName: "तंदूरी रोटी",
    slug: "tandoori-roti",
    category: "Breads",
    basePrice: 25,
    tag: "FRESH",
    description: "Smoky, crisp-edged roti straight from the tandoor.",
    image: "https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=900&q=85",
    foodType: "VEG",
    preparationTime: "5-10 mins",
    available: true,
    popular: false,
    featured: false,
    todaySpecial: false,
    variants: [
      { name: "Plain Roti", price: 20 },
      { name: "Butter Roti", price: 25 },
    ],
  },
  {
    _id: "naan-5",
    name: "Butter Naan",
    hindiName: "बटर नान",
    slug: "butter-naan",
    category: "Breads",
    basePrice: 55,
    tag: "POPULAR",
    description: "Soft naan finished with a generous touch of butter.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85",
    foodType: "VEG",
    preparationTime: "5-10 mins",
    available: true,
    popular: true,
    featured: true,
    todaySpecial: false,
    variants: [
      { name: "Plain Naan", price: 45 },
      { name: "Butter Naan", price: 55 },
      { name: "Garlic Naan", price: 75 },
    ],
  },
  {
    _id: "rice-6",
    name: "Jeera Rice",
    hindiName: "जीरा राइस",
    slug: "jeera-rice",
    category: "Rice",
    basePrice: 140,
    tag: "CLASSIC",
    description: "Fragrant basmati rice with roasted cumin.",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=85",
    foodType: "VEG",
    preparationTime: "10-15 mins",
    available: true,
    popular: false,
    featured: false,
    todaySpecial: false,
    variants: [
      { name: "Half", price: 85 },
      { name: "Full", price: 140 },
    ],
  },
  {
    _id: "biryani-7",
    name: "Veg Biryani",
    hindiName: "वेज दम बिरयानी",
    slug: "veg-biryani",
    category: "Rice",
    basePrice: 210,
    tag: "CHEF'S PICK",
    description: "Aromatic basmati layered with vegetables and herbs.",
    image: "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=900&q=85",
    foodType: "VEG",
    preparationTime: "20-25 mins",
    available: true,
    popular: true,
    featured: true,
    todaySpecial: false,
    variants: [
      { name: "Half", price: 130 },
      { name: "Full", price: 210 },
    ],
  },
  {
    _id: "lassi-8",
    name: "Sweet Lassi",
    hindiName: "मीठी लस्सी",
    slug: "sweet-lassi",
    category: "Drinks",
    basePrice: 80,
    tag: "REFRESHING",
    description: "Thick, chilled and traditionally churned.",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=900&q=85",
    foodType: "BEVERAGE",
    preparationTime: "5-10 mins",
    available: true,
    popular: true,
    featured: true,
    todaySpecial: false,
    variants: [
      { name: "Regular (300ml)", price: 80 },
      { name: "Special Malai Lassi (450ml)", price: 110 },
    ],
  },
  {
    _id: "chaas-9",
    name: "Masala Chaas",
    hindiName: "मसाला छाछ",
    slug: "masala-chaas",
    category: "Drinks",
    basePrice: 60,
    tag: "REFRESHING",
    description: "Cool buttermilk with roasted spices.",
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=900&q=85",
    foodType: "BEVERAGE",
    preparationTime: "5 mins",
    available: true,
    popular: false,
    featured: false,
    todaySpecial: false,
  },
  {
    _id: "combo-10",
    name: "Family Meal Combo",
    hindiName: "फैमिली स्पेशल कॉम्बो",
    slug: "family-meal-combo",
    category: "Combos",
    basePrice: 449,
    tag: "BEST VALUE",
    description: "Dal Tadka • Paneer Curry • 4 Butter Rotis • Jeera Rice • Salad",
    image: "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=900&q=85",
    foodType: "VEG",
    preparationTime: "25-30 mins",
    available: true,
    popular: true,
    featured: true,
    todaySpecial: true,
  },
];

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
  restaurantName: "Pandit Ji Ka Dhaba",
  tagline: "घर का स्वाद",
  logo: "",
  phone: "+91 90000 00000",
  whatsappNumber: "919000000000",
  whatsappOrdersEnabled: true,
  email: "contact@panditjikadhaba.com",
  address: "Main Road, Bhopal, Madhya Pradesh",
  googleMapsUrl: "https://maps.google.com",
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
    return fallbackDishes;
  } catch (e) {
    console.error("Error fetching dishes from MongoDB, using fallback:", e);
    return fallbackDishes;
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
      return JSON.parse(JSON.stringify(settings));
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
