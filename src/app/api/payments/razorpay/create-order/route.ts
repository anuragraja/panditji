import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Order, Payment } from "@/models";
import { createRazorpayOrder } from "@/lib/payments/razorpay";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(order.total * 100);

    const rzpOrder = await createRazorpayOrder({
      amount: amountInPaise,
      currency: "INR",
      receipt: order.orderNumber,
      notes: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        customerName: order.customerSnapshot.name,
      },
    });

    // Record pending payment in DB
    await Payment.create({
      orderId: order._id,
      orderNumber: order.orderNumber,
      razorpayOrderId: rzpOrder.id,
      method: "RAZORPAY",
      amount: order.total,
      status: "PENDING",
    });

    return NextResponse.json({
      success: true,
      razorpayOrder: rzpOrder,
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_mock",
      amount: order.total,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("Razorpay create-order error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to initiate payment." },
      { status: 500 }
    );
  }
}
