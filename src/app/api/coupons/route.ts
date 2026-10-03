import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Coupon } from "@/models/Coupon";
import { requireAdmin } from "@/lib/auth/require-admin";
import { CouponSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active") === "true";

    await connectToDatabase();
    const query = activeOnly ? { active: true, expiryDate: { $gte: new Date() } } : {};
    const coupons = await Coupon.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, coupons });
  } catch (error) {
    console.error("Fetch coupons error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const parsed = CouponSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const existing = await Coupon.findOne({ code: parsed.data.code.toUpperCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Coupon code already exists." },
        { status: 409 }
      );
    }

    const coupon = await Coupon.create(parsed.data);

    await logAudit({
      user: auth.user!.userId,
      userName: auth.user!.name,
      userRole: auth.user!.role,
      action: "CREATE_COUPON",
      entity: "Coupon",
      entityId: coupon._id.toString(),
      metadata: { code: coupon.code, discount: coupon.discountValue },
    });

    return NextResponse.json({
      success: true,
      message: "Coupon created successfully!",
      coupon,
    });
  } catch (error) {
    console.error("Create coupon error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create coupon" },
      { status: 500 }
    );
  }
}
