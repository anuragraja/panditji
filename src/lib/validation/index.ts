import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[0-9+\s-]{10,15}$/, "Invalid phone format"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const LoginSchema = z.object({
  identifier: z.string().min(1, "Please provide phone number or email"),
  password: z.string().min(1, "Password is required"),
});

export const AddressSchema = z.object({
  label: z.string().optional().default("Home"),
  houseNumber: z.string().min(1, "Flat/House number is required"),
  street: z.string().min(1, "Street / Area is required"),
  landmark: z.string().optional().default(""),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z
    .string()
    .min(6, "Pincode must be 6 digits")
    .regex(/^\d{6}$/, "Pincode must be a 6 digit number"),
  isDefault: z.boolean().optional().default(false),
});

export const CartItemOrderSchema = z.object({
  menuItemId: z.string().min(1, "Menu item ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  selectedVariant: z
    .object({
      name: z.string(),
      price: z.number(),
    })
    .optional(),
  selectedAddOns: z
    .array(
      z.object({
        name: z.string(),
        price: z.number(),
      })
    )
    .optional()
    .default([]),
  specialInstructions: z.string().max(200).optional().default(""),
});

export const CreateOrderSchema = z.object({
  name: z.string().min(2, "Full Name is required"),
  phone: z
    .string()
    .min(10, "Valid phone number is required")
    .regex(/^[0-9+\s-]{10,15}$/, "Invalid phone format"),
  email: z.string().email().optional().or(z.literal("")),
  orderType: z.enum(["DELIVERY", "PICKUP"]).default("DELIVERY"),
  deliveryAddress: AddressSchema.optional(),
  items: z.array(CartItemOrderSchema).min(1, "Cart cannot be empty"),
  couponCode: z.string().optional().default(""),
  paymentMethod: z.enum(["COD", "UPI", "RAZORPAY"]).default("COD"),
  notes: z.string().max(300).optional().default(""),
});

export const BookingSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z
    .string()
    .min(10, "Valid phone is required")
    .regex(/^[0-9+\s-]{10,15}$/, "Invalid phone format"),
  date: z.string().min(1, "Date is required"),
  time: z.string().optional().default("Lunch / Dinner"),
  guests: z.string().min(1, "Number of guests is required"),
  specialRequest: z.string().max(300).optional().default(""),
});

export const ReviewSchema = z.object({
  name: z.string().min(2, "Name is required"),
  roleTitle: z.string().optional().default("Happy Guest"),
  rating: z.number().min(1).max(5),
  comment: z.string().min(5, "Comment must be at least 5 characters"),
});

export const MenuItemSchema = z.object({
  name: z.string().min(2, "Item name is required"),
  hindiName: z.string().optional().default(""),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().min(5, "Description is required"),
  category: z.string().min(1, "Category is required"),
  image: z.string().min(1, "Image URL is required"),
  foodType: z.enum(["VEG", "NON_VEG", "BEVERAGE"]).default("VEG"),
  basePrice: z.number().positive("Base price must be greater than 0"),
  discountPrice: z.number().nonnegative().optional(),
  tag: z.string().optional().default(""),
  variants: z
    .array(
      z.object({
        name: z.string().min(1),
        price: z.number().positive(),
      })
    )
    .optional()
    .default([]),
  addOns: z
    .array(
      z.object({
        name: z.string().min(1),
        price: z.number().positive(),
      })
    )
    .optional()
    .default([]),
  preparationTime: z.string().optional().default("15-20 mins"),
  available: z.boolean().default(true),
  featured: z.boolean().default(false),
  popular: z.boolean().default(false),
  todaySpecial: z.boolean().default(false),
});

export const CategorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
  hindiName: z.string().optional().default(""),
  slug: z.string().min(2, "Slug is required"),
  displayOrder: z.number().default(0),
  isActive: z.boolean().default(true),
  image: z.string().optional().default(""),
});

export const CouponSchema = z.object({
  code: z.string().min(3).toUpperCase(),
  description: z.string().min(3),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive(),
  minOrder: z.number().nonnegative().default(0),
  maxDiscount: z.number().positive().optional(),
  startDate: z.string().or(z.date()),
  expiryDate: z.string().or(z.date()),
  usageLimit: z.number().positive().optional(),
  perUserLimit: z.number().positive().optional().default(1),
  active: z.boolean().default(true),
});
