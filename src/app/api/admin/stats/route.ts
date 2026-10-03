import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Order, User, MenuItem } from "@/models";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.authorized) return auth.response!;

  try {
    await connectToDatabase();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      todaysOrders,
      pendingOrdersCount,
      preparingOrdersCount,
      completedOrdersCount,
      totalCustomersCount,
      recentOrders,
      lowStockItems,
    ] = await Promise.all([
      // Orders today
      Order.find({ createdAt: { $gte: startOfToday } }).lean(),
      // Pending count
      Order.countDocuments({ orderStatus: "PENDING" }),
      // Preparing count
      Order.countDocuments({ orderStatus: "PREPARING" }),
      // Completed/Delivered count
      Order.countDocuments({ orderStatus: { $in: ["DELIVERED", "COMPLETED"] } }),
      // Total customers count
      User.countDocuments({ role: "CUSTOMER" }),
      // Recent 7 orders
      Order.find().sort({ createdAt: -1 }).limit(7).lean(),
      // Items marked unavailable
      MenuItem.find({ available: false }).limit(5).lean(),
    ]);

    const todaysRevenue = todaysOrders.reduce((sum, o) => {
      // count paid or non-cancelled orders
      if (o.orderStatus !== "CANCELLED") {
        return sum + o.total;
      }
      return sum;
    }, 0);

    return NextResponse.json({
      success: true,
      stats: {
        todaysOrdersCount: todaysOrders.length,
        todaysRevenue,
        pendingOrdersCount,
        preparingOrdersCount,
        completedOrdersCount,
        totalCustomersCount,
        recentOrders,
        lowStockItems,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
