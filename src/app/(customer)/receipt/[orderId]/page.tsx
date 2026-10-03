import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Order, RestaurantSettings } from "@/models";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ArrowLeft, Printer } from "lucide-react";
import { PrintButton } from "./PrintButton";

interface ReceiptPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function ReceiptPage({ params }: ReceiptPageProps) {
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
    restaurantName: "Pandit Ji Ka Dhaba",
    tagline: "घर का स्वाद",
    phone: "+91 90000 00000",
    address: "Main Road, Bhopal, Madhya Pradesh",
  };

  return (
    <div className="bg-[#fbf7ef] min-h-screen py-10 print:py-0 print:bg-white">
      <div className="container-dhaba max-w-2xl">
        {/* Navigation & Print Action */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link
            href={`/track-order/${order.orderNumber}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#526575] hover:text-[#102a43]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tracker</span>
          </Link>
          <PrintButton />
        </div>

        {/* Printable Receipt Card */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-[#e9e1d4] shadow-dhaba print:border-none print:shadow-none print:p-4 text-[#172b3a]">
          {/* Header */}
          <div className="text-center pb-6 border-b border-[#e9e1d4]">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#d99a2b] mx-auto mb-2 bg-white">
              <img
                src="/images/logo.png"
                alt="Pandit Ji Ka Dhaba"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="font-serif-dhaba font-bold text-3xl text-[#102a43]">
              {settings.restaurantName}
            </h1>
            <p className="text-xs font-bold text-[#d99a2b] tracking-widest uppercase">
              {settings.tagline}
            </p>
            <p className="text-xs text-[#6c7b87] mt-1 max-w-sm mx-auto">
              {settings.address}
            </p>
            <p className="text-xs text-[#6c7b87]">Phone: {settings.phone}</p>
          </div>

          {/* Invoice Meta */}
          <div className="grid grid-cols-2 gap-4 py-6 border-b border-[#e9e1d4] text-xs">
            <div>
              <span className="text-[#6c7b87] block">Order Receipt No:</span>
              <b className="text-sm font-black text-[#102a43] block">
                {order.orderNumber}
              </b>
              <span className="text-[#6c7b87] block mt-2">Date & Time:</span>
              <span className="font-semibold">{formatDateTime(order.createdAt)}</span>
            </div>

            <div className="text-right">
              <span className="text-[#6c7b87] block">Billed To:</span>
              <b className="text-sm font-bold text-[#102a43] block">
                {order.customerSnapshot.name}
              </b>
              <span className="text-[#6c7b87] block">{order.customerSnapshot.phone}</span>
              <span className="inline-block mt-2 font-black px-2.5 py-0.5 rounded-full bg-[#f5ead5] text-[#9a6714] text-[10px]">
                {order.orderType}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-6 border-b border-[#e9e1d4]">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#e9e1d4] text-[#6c7b87] font-bold text-left">
                  <th className="pb-2">Item Description</th>
                  <th className="pb-2 text-center">Qty</th>
                  <th className="pb-2 text-right">Rate</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e9e1d4]/40">
                {order.items.map((it, idx) => (
                  <tr key={idx} className="py-2.5">
                    <td className="py-2 pr-2">
                      <b className="text-[#102a43] block">{it.name}</b>
                      {it.selectedVariant && (
                        <span className="text-[10px] text-[#246b9b] block">
                          Portion: {it.selectedVariant.name}
                        </span>
                      )}
                      {it.selectedAddOns && it.selectedAddOns.length > 0 && (
                        <span className="text-[10px] text-[#9a6714] block">
                          Add: {it.selectedAddOns.map((a) => a.name).join(", ")}
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-center font-bold text-[#102a43]">
                      {it.quantity}
                    </td>
                    <td className="py-2 text-right text-[#6c7b87]">
                      {formatCurrency(it.unitPrice)}
                    </td>
                    <td className="py-2 text-right font-black text-[#102a43]">
                      {formatCurrency(it.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subtotal & Totals */}
          <div className="py-6 border-b border-[#e9e1d4] space-y-2 text-xs">
            <div className="flex justify-between text-[#6c7b87]">
              <span>Subtotal</span>
              <span className="font-bold text-[#102a43]">{formatCurrency(order.subtotal)}</span>
            </div>
            {order.couponDiscount > 0 && (
              <div className="flex justify-between text-[#2d7a52] font-bold">
                <span>Coupon Discount ({order.coupon})</span>
                <span>-{formatCurrency(order.couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#6c7b87]">
              <span>Delivery Fee</span>
              <span className="font-bold text-[#102a43]">
                {order.deliveryFee === 0 ? "FREE" : formatCurrency(order.deliveryFee)}
              </span>
            </div>
            {order.tax > 0 && (
              <div className="flex justify-between text-[#6c7b87]">
                <span>Taxes</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-base pt-3 border-t border-[#e9e1d4] font-black text-[#102a43]">
              <span>GRAND TOTAL</span>
              <span className="font-serif-dhaba text-2xl">{formatCurrency(order.total)}</span>
            </div>
          </div>

          {/* Payment Status & Delivery Details */}
          <div className="pt-6 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[#6c7b87] block">Payment Method:</span>
              <b className="text-[#102a43]">{order.paymentMethod}</b>
              <span className="text-[#6c7b87] block mt-1">Payment Status:</span>
              <span
                className={`font-black ${
                  order.paymentStatus === "PAID" ? "text-[#2d7a52]" : "text-[#9a6714]"
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>

            {order.deliveryAddressSnapshot && (
              <div className="text-right">
                <span className="text-[#6c7b87] block">Delivery Location:</span>
                <p className="font-semibold text-[#102a43]">
                  {order.deliveryAddressSnapshot.houseNumber},{" "}
                  {order.deliveryAddressSnapshot.street}
                </p>
                <p className="text-[#6c7b87]">
                  {order.deliveryAddressSnapshot.city} (
                  {order.deliveryAddressSnapshot.pincode})
                </p>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="mt-8 pt-6 border-t border-[#e9e1d4] text-center text-[11px] text-[#6c7b87] space-y-1">
            <p className="font-serif-dhaba font-bold text-sm text-[#102a43]">
              Thank you for choosing Pandit Ji Ka Dhaba!
            </p>
            <p>घर का स्वाद ❤️ Authentic Flavours & Warm Hospitality</p>
          </div>
        </div>
      </div>
    </div>
  );
}
