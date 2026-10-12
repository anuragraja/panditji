import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Terms of Service | Panditji Restaurant",
  },
  description:
    "Terms of service, dining conditions, and food delivery policies for Panditji Restaurant in Khajurikala, Bhopal.",
  alternates: {
    canonical: "https://panditjirestaurant.com/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="bg-[#fbf7ef] min-h-screen py-8 sm:py-16">
      <div className="container-dhaba max-w-3xl bg-white p-5 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl border border-[#e9e1d4] shadow-sm space-y-6">
        <h1 className="font-serif-dhaba font-bold text-2xl sm:text-3xl text-[#102a43]">
          Terms of Service
        </h1>
        <p className="text-xs text-[#6c7b87]">Last updated: October 2026</p>

        <section className="space-y-3 text-xs text-[#526575] leading-relaxed">
          <h2 className="font-bold text-sm text-[#102a43]">1. Food Ordering & Availability</h2>
          <p>
            All food orders are subject to fresh kitchen availability. Prices and taxes are clearly indicated before final checkout.
          </p>

          <h2 className="font-bold text-sm text-[#102a43]">2. Delivery Timings</h2>
          <p>
            Estimated delivery time is typically 30 to 45 minutes depending on traffic and peak dhaba kitchen hours.
          </p>

          <h2 className="font-bold text-sm text-[#102a43]">3. Cancellations & Refunds</h2>
          <p>
            Orders can be cancelled before the kitchen marks them as &apos;PREPARING&apos;. Once cooking has begun, cancellations cannot be accepted.
          </p>
        </section>
      </div>
    </div>
  );
}
