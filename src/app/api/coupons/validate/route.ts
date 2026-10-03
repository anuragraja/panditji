import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Coupon } from "@/models/Coupon";

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();

    if (!code || typeof subtotal !== "number") {
      return NextResponse.json(
        { success: false, message: "Code and subtotal are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      active: true,
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Invalid coupon code." },
        { status: 404 }
      );
    }

    const now = new Date();
    if (now < new Date(coupon.startDate) || now > new Date(coupon.expiryDate)) {
      return NextResponse.json(
        { success: false, message: "This coupon code has expired." },
        { status: 400 }
      );
    }

    if (subtotal < coupon.minOrder) {
      return NextResponse.json(
        {
          success: false,
          message: `Coupon requires a minimum order of ₹${coupon.minOrder}.`,
        },
        { status: 400 }
      );
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, message: "Coupon usage limit has been reached." },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      const calculated = (subtotal * coupon.discountValue) / 100;
      discountAmount = coupon.maxDiscount
        ? Math.min(calculated, coupon.maxDiscount)
        : calculated;
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }

    return NextResponse.json({
      success: true,
      message: `Coupon applied: ₹${Math.round(discountAmount)} savings!`,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Math.round(discountAmount),
      },
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
