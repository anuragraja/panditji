import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Order } from "@/models/Order";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logAudit } from "@/lib/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    const order = await Order.findOne({
      $or: [{ orderNumber: id }, ...(isMongoId ? [{ _id: id }] : [])],
    }).lean();

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch order details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(req);
  if (!auth.authorized) return auth.response!;

  try {
    const { id } = await params;
    const body = await req.json();
    const { orderStatus, paymentStatus, note } = body;

    await connectToDatabase();

    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    const order = await Order.findOne({
      $or: [{ orderNumber: id }, ...(isMongoId ? [{ _id: id }] : [])],
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    if (orderStatus && orderStatus !== order.orderStatus) {
      order.orderStatus = orderStatus;
      order.statusHistory.push({
        status: orderStatus,
        timestamp: new Date(),
        note: note || `Status updated to ${orderStatus} by ${auth.user!.name}`,
      });
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (body.whatsappSent !== undefined) {
      order.whatsappSent = body.whatsappSent;
    }

    await order.save();

    await logAudit({
      user: auth.user!.userId,
      userName: auth.user!.name,
      userRole: auth.user!.role,
      action: "UPDATE_ORDER_STATUS",
      entity: "Order",
      entityId: order._id.toString(),
      metadata: {
        orderNumber: order.orderNumber,
        newStatus: orderStatus,
        paymentStatus,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Order updated successfully!",
      order,
    });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update order" },
      { status: 500 }
    );
  }
}
