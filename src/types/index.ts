export type UserRole = "CUSTOMER" | "ADMIN";

export interface IUserAddress {
  _id?: string;
  label?: string; // Home, Work, Other
  houseNumber: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface IUser {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  passwordHash?: string;
  role: UserRole;
  addresses: IUserAddress[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ICategory {
  _id: string;
  name: string;
  hindiName?: string;
  slug: string;
  displayOrder: number;
  isActive: boolean;
  image?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IVariant {
  name: string; // e.g. "Half", "Full", "Regular", "Large"
  price: number;
}

export interface IAddOn {
  name: string; // e.g. "Extra Butter", "Extra Paneer", "Extra Roti"
  price: number;
}

export type FoodType = "VEG" | "NON_VEG" | "BEVERAGE";

export interface IMenuItem {
  _id: string;
  name: string;
  hindiName?: string;
  slug: string;
  description: string;
  category: string; // Category Name or Category ID
  image: string;
  foodType: FoodType;
  basePrice: number;
  discountPrice?: number;
  tag?: string; // "POPULAR", "CHEF'S PICK", "CLASSIC", "FRESH", "REFRESHING", "BEST VALUE"
  variants?: IVariant[];
  addOns?: IAddOn[];
  preparationTime?: string; // e.g. "20-25 mins"
  available: boolean;
  featured: boolean;
  popular: boolean;
  todaySpecial: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type OrderType = "DELIVERY" | "PICKUP";
export type PaymentMethod = "COD" | "UPI" | "RAZORPAY";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

export interface IOrderItem {
  menuItemId: string;
  name: string;
  hindiName?: string;
  image?: string;
  foodType: FoodType;
  selectedVariant?: IVariant;
  selectedAddOns?: IAddOn[];
  unitPrice: number;
  quantity: number;
  subtotal: number;
  specialInstructions?: string;
}

export interface IStatusHistory {
  status: OrderStatus;
  timestamp: string | Date;
  note?: string;
}

export interface IOrder {
  _id: string;
  orderNumber: string; // e.g. PJD-20261003-0001
  customer?: string; // User ID
  customerSnapshot: {
    name: string;
    phone: string;
    email?: string;
  };
  items: IOrderItem[];
  orderType: OrderType;
  deliveryAddressSnapshot?: IUserAddress;
  subtotal: number;
  discount: number;
  couponDiscount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  coupon?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  notes?: string;
  statusHistory: IStatusHistory[];
  whatsappSent?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IRestaurantSettings {
  _id?: string;
  restaurantName: string;
  tagline: string;
  logo: string;
  phone: string;
  whatsappNumber: string; // e.g. "919000000000"
  whatsappOrdersEnabled: boolean;
  email: string;
  address: string;
  googleMapsUrl?: string;
  openingHours: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
  };
  acceptOrders: boolean;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  minOrderAmount: number;
  deliveryFee: number;
  freeDeliveryAbove: number;
  estimatedDeliveryTime: string;
  taxEnabled: boolean;
  taxPercentage: number;
  codEnabled: boolean;
  upiEnabled: boolean;
  upiId?: string;
  onlinePaymentEnabled: boolean;
  heroHeading: string;
  heroSubtitle: string;
  heroImage: string;
  announcementBanner?: {
    enabled: boolean;
    text: string;
  };
  whatsappTemplates?: {
    confirmed?: string;
    preparing?: string;
    ready?: string;
    outForDelivery?: string;
    delivered?: string;
    cancelled?: string;
  };
}

export type BookingStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "COMPLETED" | "CANCELLED";

export interface IBooking {
  _id: string;
  name: string;
  phone: string;
  date: string;
  time?: string;
  guests: string;
  specialRequest?: string;
  status: BookingStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IReview {
  _id: string;
  customer?: string;
  order?: string;
  name: string;
  roleTitle?: string; // e.g. "Regular Guest", "Happy Guest", "Food Lover"
  rating: number; // 1 to 5
  comment: string;
  approved: boolean;
  createdAt: string | Date;
}

export type DiscountType = "PERCENTAGE" | "FIXED";

export interface ICoupon {
  _id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrder: number;
  maxDiscount?: number;
  startDate: string | Date;
  expiryDate: string | Date;
  usageLimit?: number;
  perUserLimit?: number;
  usedCount: number;
  active: boolean;
  createdAt?: string | Date;
}

export interface IAuditLog {
  _id: string;
  user?: string;
  userName?: string;
  userRole?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string | Date;
}

export interface ICartItem {
  id: string; // unique cart line item id (hash of menuItemId + variant + addOns)
  menuItemId: string;
  name: string;
  hindiName?: string;
  image?: string;
  foodType: FoodType;
  basePrice: number;
  unitPrice: number;
  selectedVariant?: IVariant;
  selectedAddOns: IAddOn[];
  quantity: number;
  specialInstructions?: string;
}
