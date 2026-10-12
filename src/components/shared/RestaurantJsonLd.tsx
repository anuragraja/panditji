import React from "react";
import { IRestaurantSettings } from "@/types";

export function RestaurantJsonLd({ settings }: { settings?: IRestaurantSettings | null }) {
  const verifiedPhone =
    settings?.phone && !settings.phone.includes("90000") && !settings.phone.includes("6268")
      ? settings.phone
      : "+91 86430 10994";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": "https://panditjirestaurant.com/#restaurant",
    name: "Panditji Restaurant",
    alternateName: ["Pandit Ji Ka Dhaba", "Panditji Restaurant Bhopal"],
    url: "https://panditjirestaurant.com/",
    logo: "https://panditjirestaurant.com/images/logo.png",
    image: [
      "https://panditjirestaurant.com/images/logo.png",
      settings?.heroImage ||
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80",
    ],
    description:
      "Discover Panditji Restaurant in Khajurikala, Bhopal. Explore our menu, view food photos, check opening hours and find directions to visit us.",
    telephone: verifiedPhone,
    servesCuisine: ["Indian", "North Indian", "Desi Dhaba Cuisine"],
    priceRange: "₹100 - ₹500",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, UPI, Credit Card, Debit Card",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Khajurikala",
      addressLocality: "Bhopal",
      addressRegion: "Madhya Pradesh",
      postalCode: "462022",
      addressCountry: "IN",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "11:00",
        closes: "23:00",
      },
    ],
    menu: "https://panditjirestaurant.com/menu",
    acceptsReservations: "True",
    hasMap:
      "https://www.google.com/maps/search/?api=1&query=Panditji+Restaurant+Khajurikala+Bhopal+Madhya+Pradesh+462022",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

