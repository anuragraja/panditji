import React from "react";
import { IRestaurantSettings } from "@/types";

export function RestaurantJsonLd({ settings }: { settings?: IRestaurantSettings | null }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: settings?.restaurantName || "Pandit Ji Ka Dhaba",
    alternateName: "Pandit Ji Ka Dhaba | घर का स्वाद",
    image:
      settings?.heroImage ||
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80",
    description:
      settings?.tagline ||
      "Authentic Indian Dhaba Kitchen serving pure desi flavours, tandoori breads, and fresh meals.",
    telephone: settings?.phone || "+91 90000 00000",
    servesCuisine: "Indian",
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: settings?.address || "Main Road",
      addressLocality: "Bhopal",
      addressRegion: "Madhya Pradesh",
      postalCode: "462001",
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
    menu: "https://panditjikadhaba.com/menu",
    acceptsReservations: "True",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
