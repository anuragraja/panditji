import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Order, Payment } from "@/models";
import { verifyRazorpayWebhook } from "@/lib/payments/razorpay";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (process.env.RAZORPAY_WEBHOOK_SECRET) {
      if (!signature || !verifyRazorpayWebhook(rawBody, signature)) {
        return NextResponse.json(
          { success: false, message: "Invalid webhook signature" },
          { status: 400 }
        );
      }
    }

    const event = JSON.parse(rawBody);
    await connectToDatabase();

    if (event.event === "payment.captured") {
      const paymentEntity = event.payload.payment.entity;
      const rzpOrderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      const payment = await Payment.findOne({ razorpayOrderId: rzpOrderId });
      if (payment && payment.status !== "PAID") {
        payment.status = "PAID";
        payment.razorpayPaymentId = paymentId;
        payment.webhookEvent = event.event;
        payment.webhookPayload = event;
        await payment.save();

        const order = await Order.findById(payment.orderId);
        if (order && order.paymentStatus !== "PAID") {
          order.paymentStatus = "PAID";
          order.orderStatus = "CONFIRMED";
          order.statusHistory.push({
            status: "CONFIRMED",
            timestamp: new Date(),
            note: `Payment captured via Webhook (Payment ID: ${paymentId})`,
          });
          await order.save();
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json(
      { success: false, message: "Webhook processing error" },
      { status: 500 }
    );
  }
}
