import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Order, MenuItem, RestaurantSettings, Coupon } from "@/models";
import { CreateOrderSchema } from "@/lib/validation";
import { getUserFromRequest } from "@/lib/auth/jwt";
import { generateOrderNumber } from "@/lib/utils";
import { IOrderItem, OrderStatus } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const {
      name,
      phone,
      email,
      orderType,
      deliveryAddress,
      items: rawItems,
      couponCode,
      paymentMethod,
      notes,
    } = parsed.data;

    await connectToDatabase();

    // Fetch Restaurant Settings
    const settings = (await RestaurantSettings.findOne().lean()) || {
      acceptOrders: true,
      deliveryEnabled: true,
      pickupEnabled: true,
      minOrderAmount: 150,
      deliveryFee: 30,
      freeDeliveryAbove: 499,
      taxEnabled: false,
      taxPercentage: 5,
    };

    if (!settings.acceptOrders) {
      return NextResponse.json(
        {
          success: false,
          message:
            "We are currently not accepting new orders. Please check back during opening hours.",
        },
        { status: 400 }
      );
    }

    if (orderType === "DELIVERY" && !settings.deliveryEnabled) {
      return NextResponse.json(
        {
          success: false,
          message: "Delivery is currently disabled. Please choose self pickup.",
        },
        { status: 400 }
      );
    }

    if (orderType === "PICKUP" && !settings.pickupEnabled) {
      return NextResponse.json(
        {
          success: false,
          message: "Pickup is currently disabled. Please choose delivery.",
        },
        { status: 400 }
      );
    }

    // Step 2 & 3: Retrieve products from DB & validate availability
    const menuItemIds = rawItems.map((i) => i.menuItemId);
    const dbMenuItems = await MenuItem.find({ _id: { $in: menuItemIds } });

    if (dbMenuItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid items found in order." },
        { status: 400 }
      );
    }

    const dbMap = new Map(dbMenuItems.map((item) => [item._id.toString(), item]));

    // Step 4: Calculate prices server-side & freeze snapshot
    let subtotal = 0;
    const orderItemsSnapshot: IOrderItem[] = [];

    for (const clientItem of rawItems) {
      const dbItem = dbMap.get(clientItem.menuItemId);
      if (!dbItem) {
        return NextResponse.json(
          {
            success: false,
            message: `One of the ordered items is no longer on the menu.`,
          },
          { status: 400 }
        );
      }

      if (!dbItem.available) {
        return NextResponse.json(
          {
            success: false,
            message: `"${dbItem.name}" is currently unavailable. Please remove it to proceed.`,
          },
          { status: 400 }
        );
      }

      // Calculate unit price strictly based on DB data
      let unitPrice = dbItem.discountPrice || dbItem.basePrice;

      // Check variant
      let frozenVariant = undefined;
      if (clientItem.selectedVariant) {
        const foundVariant = dbItem.variants?.find(
          (v) => v.name === clientItem.selectedVariant?.name
        );
        if (foundVariant) {
          unitPrice = foundVariant.price;
          frozenVariant = { name: foundVariant.name, price: foundVariant.price };
        }
      }

      // Check add-ons
      const frozenAddOns = [];
      if (clientItem.selectedAddOns && clientItem.selectedAddOns.length > 0) {
        for (const clientAddOn of clientItem.selectedAddOns) {
          const foundAddOn = dbItem.addOns?.find((a) => a.name === clientAddOn.name);
          if (foundAddOn) {
            unitPrice += foundAddOn.price;
            frozenAddOns.push({ name: foundAddOn.name, price: foundAddOn.price });
          }
        }
      }

      const itemSubtotal = unitPrice * clientItem.quantity;
      subtotal += itemSubtotal;

      orderItemsSnapshot.push({
        menuItemId: dbItem._id.toString(),
        name: dbItem.name,
        hindiName: dbItem.hindiName,
        image: dbItem.image,
        foodType: dbItem.foodType,
        selectedVariant: frozenVariant,
        selectedAddOns: frozenAddOns,
        unitPrice,
        quantity: clientItem.quantity,
        subtotal: itemSubtotal,
        specialInstructions: clientItem.specialInstructions,
      });
    }

    // Minimum order check
    if (subtotal < (settings.minOrderAmount || 0)) {
      return NextResponse.json(
        {
          success: false,
          message: `Minimum order amount is ₹${settings.minOrderAmount}. Please add more items.`,
        },
        { status: 400 }
      );
    }

    // Step 5: Server-side Coupon validation
    let couponDiscount = 0;
    let validatedCouponCode: string | undefined = undefined;

    if (couponCode && couponCode.trim()) {
      const coupon = await Coupon.findOne({
        code: couponCode.trim().toUpperCase(),
        active: true,
      });

      if (coupon) {
        const now = new Date();
        const validDates =
          now >= new Date(coupon.startDate) && now <= new Date(coupon.expiryDate);
        const validMinOrder = subtotal >= (coupon.minOrder || 0);
        const validLimit = !coupon.usageLimit || coupon.usedCount < coupon.usageLimit;

        if (validDates && validMinOrder && validLimit) {
          validatedCouponCode = coupon.code;
          if (coupon.discountType === "PERCENTAGE") {
            const calculated = (subtotal * coupon.discountValue) / 100;
            couponDiscount = coupon.maxDiscount
              ? Math.min(calculated, coupon.maxDiscount)
              : calculated;
          } else {
            couponDiscount = coupon.discountValue;
          }

          // Increment coupon usage
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    // Step 6: Delivery fee & tax
    let deliveryFee = 0;
    if (orderType === "DELIVERY") {
      const freeAbove = settings.freeDeliveryAbove || 499;
      if (subtotal < freeAbove) {
        deliveryFee = settings.deliveryFee || 30;
      }
    }

    let tax = 0;
    if (settings.taxEnabled && settings.taxPercentage > 0) {
      tax = Math.round(((subtotal - couponDiscount) * settings.taxPercentage) / 100);
    }

    const total = Math.max(0, subtotal - couponDiscount + deliveryFee + tax);

    // Step 7 & 8: Generate Order Number and Create Order in DB
    const orderNumber = generateOrderNumber();
    const currentUser = getUserFromRequest(req);

    const initialStatus: OrderStatus = "PENDING";

    const newOrder = await Order.create({
      orderNumber,
      customer: currentUser?.userId,
      customerSnapshot: {
        name,
        phone,
        email: email || currentUser?.email,
      },
      items: orderItemsSnapshot,
      orderType,
      deliveryAddressSnapshot: orderType === "DELIVERY" ? deliveryAddress : undefined,
      subtotal,
      discount: 0,
      couponDiscount,
      deliveryFee,
      tax,
      total,
      coupon: validatedCouponCode,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "PENDING" : "PENDING",
      orderStatus: initialStatus,
      notes: notes || "",
      statusHistory: [
        {
          status: initialStatus,
          timestamp: new Date(),
          note: "Order placed successfully by customer.",
        },
      ],
      whatsappSent: false,
    });

    return NextResponse.json({
      success: true,
      message: "Order placed successfully!",
      order: newOrder,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to place order. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    if (user.role === "ADMIN") {
      const status = searchParams.get("status");
      const orderType = searchParams.get("type");
      const search = searchParams.get("search");

      const query: Record<string, unknown> = {};
      if (status && status !== "ALL") {
        query.orderStatus = status;
      }
      if (orderType && orderType !== "ALL") {
        query.orderType = orderType;
      }
      if (search) {
        query.$or = [
          { orderNumber: { $regex: search, $options: "i" } },
          { "customerSnapshot.name": { $regex: search, $options: "i" } },
          { "customerSnapshot.phone": { $regex: search, $options: "i" } },
        ];
      }

      const orders = await Order.find(query).sort({ createdAt: -1 }).limit(100).lean();
      return NextResponse.json({ success: true, orders });
    } else {
      // Customer: only fetch their own orders
      const orders = await Order.find({ customer: user.userId })
        .sort({ createdAt: -1 })
        .lean();
      return NextResponse.json({ success: true, orders });
    }
  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
