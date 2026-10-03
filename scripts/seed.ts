import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pandit_ji_ka_dhaba";

async function seed() {
  console.log("Connecting to MongoDB...", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB successfully!");

  const {
    Category,
    MenuItem,
    RestaurantSettings,
    Review,
    Coupon,
  } = await import("../src/models");

  // 1. Categories
  const categoriesData = [
    { name: "Main Course", hindiName: "मुख्य व्यंजन", slug: "main-course", displayOrder: 1, isActive: true },
    { name: "Breads", hindiName: "रोटियां व नान", slug: "breads", displayOrder: 2, isActive: true },
    { name: "Rice", hindiName: "चावल व बिरयानी", slug: "rice", displayOrder: 3, isActive: true },
    { name: "Drinks", hindiName: "पेय पदार्थ", slug: "drinks", displayOrder: 4, isActive: true },
    { name: "Combos", hindiName: "थाली व कॉम्बो", slug: "combos", displayOrder: 5, isActive: true },
    { name: "Desserts", hindiName: "मीठा", slug: "desserts", displayOrder: 6, isActive: true },
    { name: "Snacks", hindiName: "नाश्ता", slug: "snacks", displayOrder: 7, isActive: true },
  ];

  for (const cat of categoriesData) {
    await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true, new: true });
  }
  console.log("Categories seeded successfully.");

  // 2. Menu Items (All from attached HTML + variants and add-ons)
  const menuItemsData = [
    {
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
      variants: [
        { name: "Half", price: 95 },
        { name: "Full", price: 160 },
      ],
      addOns: [{ name: "Extra Desi Ghee", price: 30 }],
    },
    {
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
      variants: [
        { name: "Half", price: 105 },
        { name: "Full", price: 170 },
      ],
      addOns: [{ name: "Extra Bhatura", price: 40 }],
    },
    {
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
      variants: [
        { name: "Plain Roti", price: 20 },
        { name: "Butter Roti", price: 25 },
      ],
      addOns: [{ name: "Extra Ghee Brush", price: 10 }],
    },
    {
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
      variants: [
        { name: "Plain Naan", price: 45 },
        { name: "Butter Naan", price: 55 },
        { name: "Garlic Naan", price: 75 },
      ],
      addOns: [{ name: "Extra Butter", price: 20 }],
    },
    {
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
      variants: [
        { name: "Half", price: 85 },
        { name: "Full", price: 140 },
      ],
      addOns: [{ name: "Extra Ghee", price: 25 }],
    },
    {
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
      variants: [
        { name: "Half", price: 130 },
        { name: "Full", price: 210 },
      ],
      addOns: [{ name: "Boondi Raita", price: 40 }],
    },
    {
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
      variants: [
        { name: "Regular (300ml)", price: 80 },
        { name: "Special Malai Lassi (450ml)", price: 110 },
      ],
    },
    {
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
    },
    {
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
      addOns: [
        { name: "Add 2 Extra Butter Rotis", price: 45 },
        { name: "Add Gulab Jamun (2 pcs)", price: 60 },
      ],
    },
  ];

  for (const item of menuItemsData) {
    await MenuItem.findOneAndUpdate({ slug: item.slug }, item, { upsert: true, new: true });
  }
  console.log("Menu items seeded successfully.");

  // 3. Restaurant Settings
  const defaultSettings = {
    restaurantName: "Pandit Ji Ka Dhaba",
    tagline: "घर का स्वाद",
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
      enabled: true,
      text: "Swagatam! Authentic desi flavours served hot. Free delivery on orders above ₹499.",
    },
  };

  const existingSettings = await RestaurantSettings.findOne();
  if (!existingSettings) {
    await RestaurantSettings.create(defaultSettings);
    console.log("Restaurant settings created.");
  } else {
    console.log("Restaurant settings already exist.");
  }

  // 4. Seed Reviews (Exact 3 from HTML)
  const reviewsData = [
    {
      name: "Rahul Sharma",
      roleTitle: "Regular Guest",
      rating: 5,
      comment: "The food has that proper ghar-jaisa taste. Paneer and dal were excellent.",
      approved: true,
    },
    {
      name: "Priya Verma",
      roleTitle: "Happy Guest",
      rating: 5,
      comment: "Great service, fresh food and a really comfortable family atmosphere.",
      approved: true,
    },
    {
      name: "Arjun Singh",
      roleTitle: "Food Lover",
      rating: 5,
      comment: "Loved the traditional flavours. The family combo is filling and delicious.",
      approved: true,
    },
  ];

  for (const rev of reviewsData) {
    await Review.findOneAndUpdate({ name: rev.name }, rev, { upsert: true, new: true });
  }
  console.log("Reviews seeded successfully.");

  // 5. Seed Coupons
  const couponsData = [
    {
      code: "PANDIT10",
      description: "10% OFF on orders above ₹399",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrder: 399,
      maxDiscount: 100,
      startDate: new Date(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      usageLimit: 1000,
      perUserLimit: 5,
      usedCount: 0,
      active: true,
    },
    {
      code: "DESISWAD",
      description: "Flat ₹50 OFF on orders above ₹499",
      discountType: "FIXED",
      discountValue: 50,
      minOrder: 499,
      startDate: new Date(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      usageLimit: 1000,
      perUserLimit: 3,
      usedCount: 0,
      active: true,
    },
  ];

  for (const c of couponsData) {
    await Coupon.findOneAndUpdate({ code: c.code }, c, { upsert: true, new: true });
  }
  console.log("Coupons seeded successfully.");

  console.log("Database Seeding Completed Successfully! 🌱");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
