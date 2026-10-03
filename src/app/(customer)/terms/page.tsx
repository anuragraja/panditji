import React from "react";

export const metadata = {
  title: "Terms & Conditions | Pandit Ji Ka Dhaba",
};

export default function TermsPage() {
  return (
    <div className="bg-[#fbf7ef] min-h-screen py-16">
      <div className="container-dhaba max-w-3xl bg-white p-8 md:p-12 rounded-3xl border border-[#e9e1d4] shadow-sm space-y-6">
        <h1 className="font-serif-dhaba font-bold text-3xl text-[#102a43]">
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
