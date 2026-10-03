import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { User, Order } from "@/models";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.authorized) return auth.response!;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    await connectToDatabase();

    const query: Record<string, unknown> = { role: "CUSTOMER" };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const customers = await User.find(query)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .lean();

    // Enrich with order statistics
    const customerStats = await Promise.all(
      customers.map(async (c) => {
        const orders = await Order.find({
          $or: [{ customer: c._id }, { "customerSnapshot.phone": c.phone }],
        }).lean();

        const totalSpent = orders.reduce((sum, o) => {
          return o.orderStatus !== "CANCELLED" ? sum + o.total : sum;
        }, 0);

        const lastOrder = orders.length > 0 ? orders[0].createdAt : null;

        return {
          _id: c._id,
          name: c.name,
          phone: c.phone,
          email: c.email,
          totalOrders: orders.length,
          totalSpent,
          lastOrder,
          createdAt: c.createdAt,
          addresses: c.addresses || [],
        };
      })
    );

    return NextResponse.json({ success: true, customers: customerStats });
  } catch (error) {
    console.error("Fetch customers error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
