import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Order, RestaurantSettings } from "@/models";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { OrderStatus, OrderType } from "@/types";
import { ArrowLeft, Check, Clock, Bike, Utensils, Home, Phone, AlertCircle } from "lucide-react";

interface TrackOrderPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function TrackOrderPage({ params }: TrackOrderPageProps) {
  const { orderId } = await params;
  await connectToDatabase();

  const isMongoId = /^[0-9a-fA-F]{24}$/.test(orderId);
  const order = await Order.findOne({
    $or: [{ orderNumber: orderId }, ...(isMongoId ? [{ _id: orderId }] : [])],
  }).lean();

  if (!order) {
    notFound();
  }

  const settings = (await RestaurantSettings.findOne().lean()) || {
    phone: "+91 90000 00000",
  };

  const deliverySteps: { status: OrderStatus; label: string; icon: string }[] = [
    { status: "PENDING", label: "Order Placed", icon: "📝" },
    { status: "CONFIRMED", label: "Confirmed", icon: "👨‍🍳" },
    { status: "PREPARING", label: "Preparing in Dhaba Kitchen", icon: "🥘" },
    { status: "READY", label: "Food Packed & Ready", icon: "📦" },
    { status: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: "🛵" },
    { status: "DELIVERED", label: "Delivered", icon: "❤️" },
  ];

  const pickupSteps: { status: OrderStatus; label: string; icon: string }[] = [
    { status: "PENDING", label: "Order Placed", icon: "📝" },
    { status: "CONFIRMED", label: "Confirmed", icon: "👨‍🍳" },
    { status: "PREPARING", label: "Preparing in Dhaba Kitchen", icon: "🥘" },
    { status: "READY_FOR_PICKUP", label: "Ready for Pickup", icon: "🛍️" },
    { status: "COMPLETED", label: "Completed", icon: "❤️" },
  ];

  const steps = order.orderType === "PICKUP" ? pickupSteps : deliverySteps;

  const getStepIndex = (status: OrderStatus) => {
    if (status === "READY" && order.orderType === "PICKUP") return 3;
    if (status === "READY_FOR_PICKUP") return 3;
    if (status === "COMPLETED") return steps.length - 1;
    return steps.findIndex((s) => s.status === status);
  };

  const currentStepIdx = getStepIndex(order.orderStatus as OrderStatus);
  const isCancelled = order.orderStatus === "CANCELLED";

  return (
    <div className="bg-[#fbf7ef] min-h-screen py-10">
      <div className="container-dhaba max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#526575] hover:text-[#102a43] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Status Header Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e9e1d4] shadow-sm mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#e9e1d4]">
            <div>
              <span className="text-[11px] font-black tracking-widest text-[#d99a2b] uppercase">
                LIVE ORDER TRACKING
              </span>
              <h1 className="font-serif-dhaba font-bold text-2xl md:text-3xl text-[#102a43] mt-1">
                Order #{order.orderNumber}
              </h1>
              <span className="text-xs text-[#6c7b87]">
                Placed on {formatDateTime(order.createdAt)}
              </span>
            </div>

            <div className="text-right max-sm:text-left">
              <span
                className={`inline-block px-3.5 py-1.5 rounded-full text-xs font-black ${
                  isCancelled
                    ? "bg-red-100 text-red-700"
                    : order.orderStatus === "DELIVERED" || order.orderStatus === "COMPLETED"
                    ? "bg-green-100 text-green-800"
                    : "bg-[#f5ead5] text-[#9a6714]"
                }`}
              >
                {order.orderStatus.replace(/_/g, " ")}
              </span>
              <span className="block text-sm font-black text-[#102a43] mt-1">
                {formatCurrency(order.total)} • {order.paymentMethod}
              </span>
            </div>
          </div>

          {/* Cancelled Banner */}
          {isCancelled ? (
            <div className="my-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <div>
                <b className="block text-sm font-bold">This order was cancelled</b>
                <span className="text-xs">
                  Please call the restaurant at {settings.phone} if you have any questions.
                </span>
              </div>
            </div>
          ) : (
            /* Timeline Progress */
            <div className="py-8">
              <div className="relative pl-6 md:pl-8 space-y-8 before:absolute before:left-[17px] md:before:left-[21px] before:top-3 before:bottom-3 before:w-0.5 before:bg-[#e9e1d4]">
                {steps.map((step, idx) => {
                  const isDone = currentStepIdx >= idx;
                  const isCurrent = currentStepIdx === idx;

                  return (
                    <div key={step.status} className="relative flex items-start gap-4">
                      {/* Step Circle */}
                      <div
                        className={`absolute -left-[24px] md:-left-[28px] w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                          isDone
                            ? "bg-[#2d7a52] text-white shadow-md scale-105"
                            : isCurrent
                            ? "bg-[#d99a2b] text-white shadow-md ring-4 ring-[#d99a2b]/20 scale-110"
                            : "bg-[#f0ece4] text-[#6c7b87]"
                        }`}
                      >
                        {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                      </div>

                      <div className="pt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{step.icon}</span>
                          <b
                            className={`text-sm md:text-base font-bold ${
                              isCurrent
                                ? "text-[#d99a2b]"
                                : isDone
                                ? "text-[#102a43]"
                                : "text-[#89959e]"
                            }`}
                          >
                            {step.label}
                          </b>
                          {isCurrent && (
                            <span className="text-[10px] bg-[#d99a2b] text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                              In Progress
                            </span>
                          )}
                        </div>

                        {/* Matching note from status history */}
                        {order.statusHistory && (
                          <div className="text-xs text-[#6c7b87] mt-0.5">
                            {order.statusHistory.find((h) => h.status === step.status)?.note}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Need help footer */}
          <div className="pt-4 border-t border-[#e9e1d4] flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs text-[#6c7b87]">
              Need to contact Pandit Ji Ka Dhaba regarding your food?
            </span>
            <a
              href={`tel:${settings.phone}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#102a43] bg-[#f5ead5] hover:bg-[#d99a2b] hover:text-white px-3.5 py-2 rounded-xl transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Dhaba ({settings.phone})</span>
            </a>
          </div>
        </div>

        {/* Order Details & Delivery Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Items */}
          <div className="bg-white rounded-3xl p-6 border border-[#e9e1d4] shadow-sm">
            <h3 className="font-serif-dhaba font-bold text-lg text-[#102a43] mb-4 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-[#d99a2b]" />
              <span>Items in Order</span>
            </h3>

            <div className="divide-y divide-[#e9e1d4]/60 space-y-2">
              {order.items.map((it, idx) => (
                <div key={idx} className="pt-2 first:pt-0 flex justify-between text-xs">
                  <div>
                    <b className="text-[#102a43]">{it.name}</b>
                    <span className="text-[#6c7b87] block">
                      {it.quantity} × {formatCurrency(it.unitPrice)}
                      {it.selectedVariant ? ` (${it.selectedVariant.name})` : ""}
                    </span>
                    {it.specialInstructions && (
                      <span className="text-[10px] text-[#9a6714] italic block">
                        Note: {it.specialInstructions}
                      </span>
                    )}
                  </div>
                  <b className="text-[#102a43]">{formatCurrency(it.subtotal)}</b>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[#e9e1d4] text-xs space-y-1.5">
              <div className="flex justify-between text-[#6c7b87]">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.couponDiscount > 0 && (
                <div className="flex justify-between text-[#2d7a52]">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#6c7b87]">
                <span>Delivery</span>
                <span>{order.deliveryFee === 0 ? "FREE" : formatCurrency(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#102a43] pt-1">
                <span>Total Paid / Payable</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-white rounded-3xl p-6 border border-[#e9e1d4] shadow-sm space-y-4">
            <h3 className="font-serif-dhaba font-bold text-lg text-[#102a43] flex items-center gap-2">
              {order.orderType === "DELIVERY" ? (
                <>
                  <Bike className="w-4 h-4 text-[#d99a2b]" />
                  <span>Delivery Address</span>
                </>
              ) : (
                <>
                  <Home className="w-4 h-4 text-[#246b9b]" />
                  <span>Self Pickup</span>
                </>
              )}
            </h3>

            {order.orderType === "DELIVERY" && order.deliveryAddressSnapshot ? (
              <div className="text-xs text-[#526575] space-y-1">
                <b className="text-sm text-[#102a43] block">
                  {order.customerSnapshot.name}
                </b>
                <p>Phone: {order.customerSnapshot.phone}</p>
                <p>
                  {order.deliveryAddressSnapshot.houseNumber},{" "}
                  {order.deliveryAddressSnapshot.street}
                </p>
                {order.deliveryAddressSnapshot.landmark && (
                  <p>Landmark: {order.deliveryAddressSnapshot.landmark}</p>
                )}
                <p>
                  {order.deliveryAddressSnapshot.city},{" "}
                  {order.deliveryAddressSnapshot.state} -{" "}
                  {order.deliveryAddressSnapshot.pincode}
                </p>
              </div>
            ) : (
              <div className="text-xs text-[#526575] space-y-1">
                <b className="text-sm text-[#102a43] block">Pickup Counter</b>
                <p>Customer: {order.customerSnapshot.name}</p>
                <p>Phone: {order.customerSnapshot.phone}</p>
                <p className="mt-2 text-[#9a6714] font-semibold">
                  Please show your Order ID at the counter when you arrive.
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-[#e9e1d4]">
              <Link
                href={`/receipt/${order.orderNumber}`}
                className="w-full btn-dhaba bg-[#fffaf2] hover:bg-[#f5ead5] text-[#102a43] border border-[#d99a2b]/30 py-3 text-xs font-bold flex items-center justify-center gap-2"
              >
                <span>Print Official Receipt</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
