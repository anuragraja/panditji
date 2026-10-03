import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Order, Payment } from "@/models";
import { verifyRazorpaySignature, isRazorpayConfigured } from "@/lib/payments/razorpay";

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } =
      await req.json();

    if (!orderId || !razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json(
        { success: false, message: "Missing required payment details" },
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

    // Verify signature if Razorpay is configured
    if (isRazorpayConfigured()) {
      const isValid = verifyRazorpaySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      if (!isValid) {
        return NextResponse.json(
          { success: false, message: "Invalid payment signature." },
          { status: 400 }
        );
      }
    }

    // Update Order & Payment
    order.paymentStatus = "PAID";
    order.orderStatus = "CONFIRMED";
    order.statusHistory.push({
      status: "CONFIRMED",
      timestamp: new Date(),
      note: `Online Payment Verified (Payment ID: ${razorpay_payment_id})`,
    });
    await order.save();

    await Payment.findOneAndUpdate(
      { orderId: order._id },
      {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "PAID",
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully!",
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, message: "Payment verification failed" },
      { status: 500 }
    );
  }
}
