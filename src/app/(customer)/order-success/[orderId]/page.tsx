import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Order } from "@/models";
import { getSettings } from "@/services/restaurant";
import { buildOrderWhatsAppText, buildWhatsAppUrl } from "@/lib/whatsapp/message-builder";
import { OrderSuccessClient } from "./OrderSuccessClient";

export const metadata: Metadata = {
  title: "Order Confirmed | Panditji Restaurant",
  robots: {
    index: false,
    follow: false,
  },
};

interface OrderSuccessPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { orderId } = await params;
  await connectToDatabase();

  const isMongoId = /^[0-9a-fA-F]{24}$/.test(orderId);
  const order = await Order.findOne({
    $or: [{ orderNumber: orderId }, ...(isMongoId ? [{ _id: orderId }] : [])],
  }).lean();

  if (!order) {
    notFound();
  }

  const settings = await getSettings();

  const plainOrder = JSON.parse(JSON.stringify(order));
  const waMessageText = buildOrderWhatsAppText(plainOrder);
  const waUrl = buildWhatsAppUrl(settings.whatsappNumber || "918643010994", waMessageText);

  return (
    <div className="bg-[#fbf7ef] min-h-screen py-16 flex items-center justify-center">
      <div className="container-dhaba max-w-xl">
        <OrderSuccessClient
          order={plainOrder}
          whatsappUrl={waUrl}
          whatsappText={waMessageText}
          whatsappOrdersEnabled={settings.whatsappOrdersEnabled}
        />
      </div>
    </div>
  );
}
