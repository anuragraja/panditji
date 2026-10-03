import React from "react";
import { ContactBookingSection } from "@/components/customer/ContactBookingSection";
import { getSettings } from "@/services/restaurant";

export const metadata = {
  title: "Contact & Table Booking | Pandit Ji Ka Dhaba",
  description:
    "Visit Pandit Ji Ka Dhaba or book a table. Enjoy genuine desi food, family-style seating, and warm hospitality.",
};

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <div className="bg-[#fbf7ef] min-h-screen">
      <div className="bg-[#102a43] text-white py-14">
        <div className="container-dhaba text-center">
          <div className="kicker text-[#f5d28d] justify-center">REACH OUT TO US</div>
          <h1 className="font-serif-dhaba font-bold text-4xl mt-2">
            We Would Love To Host You
          </h1>
          <p className="text-xs text-[#cbd8e0] mt-2 max-w-lg mx-auto">
            Drop in for a hearty meal or reserve your table in advance.
          </p>
        </div>
      </div>
      <ContactBookingSection settings={settings} />
    </div>
  );
}
