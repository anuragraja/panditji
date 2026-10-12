import React from "react";
import type { Metadata } from "next";
import { ContactBookingSection } from "@/components/customer/ContactBookingSection";
import { getSettings } from "@/services/restaurant";

export const metadata: Metadata = {
  title: {
    absolute: "Contact & Directions | Panditji Restaurant Khajurikala, Bhopal",
  },
  description:
    "Contact Panditji Restaurant in Khajurikala, Bhopal. View our address, phone number, opening hours, get Google Maps directions, or book a dining table.",
  alternates: {
    canonical: "https://panditjirestaurant.com/contact",
  },
  openGraph: {
    title: "Contact & Directions | Panditji Restaurant Khajurikala, Bhopal",
    description:
      "Contact Panditji Restaurant in Khajurikala, Bhopal. View our address, phone number, opening hours, get Google Maps directions, or book a dining table.",
    url: "https://panditjirestaurant.com/contact",
    siteName: "Panditji Restaurant",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact & Directions | Panditji Restaurant Khajurikala, Bhopal",
    description:
      "Contact Panditji Restaurant in Khajurikala, Bhopal. View our address, phone number, opening hours, get Google Maps directions, or book a dining table.",
  },
};

export default async function ContactPage() {
  const settings = await getSettings();

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://panditjirestaurant.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Contact & Directions",
        item: "https://panditjirestaurant.com/contact",
      },
    ],
  };

  return (
    <div className="bg-[#fbf7ef] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <div className="bg-[#102a43] text-white py-10 sm:py-14">
        <div className="container-dhaba text-center">
          <div className="kicker text-[#f5d28d] justify-center">VISIT US IN KHAJURIKALA, BHOPAL</div>
          <h1 className="font-serif-dhaba font-bold text-2xl sm:text-3xl md:text-4xl mt-2">
            We Would Love To Host You
          </h1>
          <p className="text-xs text-[#cbd8e0] mt-2 max-w-lg mx-auto">
            Drop in for a hearty meal, check our location, or reserve your table in advance.
          </p>
        </div>
      </div>
      <ContactBookingSection settings={settings} />
    </div>
  );
}
