import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Order } from "@/models/Order";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.authorized) return auth.response!;

  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "7"; // 7, 30, or all

    await connectToDatabase();

    const daysCount = parseInt(range) || 7;
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - daysCount);
    sinceDate.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      createdAt: { $gte: sinceDate },
      orderStatus: { $ne: "CANCELLED" },
    })
      .sort({ createdAt: 1 })
      .lean();

    // Group revenue and order count by date string YYYY-MM-DD
    const chartMap: Record<string, { date: string; revenue: number; orders: number }> = {};
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const displayLabel = d.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });
      chartMap[key] = { date: displayLabel, revenue: 0, orders: 0 };
    }

    // Payment methods map
    const paymentMethodsMap: Record<string, number> = { COD: 0, UPI: 0, RAZORPAY: 0 };

    // Item popularity map
    const itemMap: Record<string, { name: string; count: number; revenue: number }> = {};

    let totalRevenue = 0;

    for (const order of orders) {
      const dateKey = new Date(order.createdAt).toISOString().split("T")[0];
      if (chartMap[dateKey]) {
        chartMap[dateKey].revenue += order.total;
        chartMap[dateKey].orders += 1;
      }
      totalRevenue += order.total;

      // Payment method tally
      if (order.paymentMethod) {
        paymentMethodsMap[order.paymentMethod] =
          (paymentMethodsMap[order.paymentMethod] || 0) + 1;
      }

      // Items tally
      for (const it of order.items) {
        if (!itemMap[it.name]) {
          itemMap[it.name] = { name: it.name, count: 0, revenue: 0 };
        }
        itemMap[it.name].count += it.quantity;
        itemMap[it.name].revenue += it.subtotal;
      }
    }

    const chartData = Object.values(chartMap);
    const topDishes = Object.values(itemMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      report: {
        totalRevenue,
        totalOrders: orders.length,
        chartData,
        topDishes,
        paymentMethods: [
          { name: "Cash on Delivery", count: paymentMethodsMap.COD || 0 },
          { name: "UPI", count: paymentMethodsMap.UPI || 0 },
          { name: "Online Payment", count: paymentMethodsMap.RAZORPAY || 0 },
        ],
      },
    });
  } catch (error) {
    console.error("Admin reports error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate reports" },
      { status: 500 }
    );
  }
}
