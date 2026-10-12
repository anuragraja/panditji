import React from "react";
import type { Metadata } from "next";
import { AboutSection } from "@/components/customer/AboutSection";
import { TrustStrip } from "@/components/customer/TrustStrip";
import { GallerySection } from "@/components/customer/GallerySection";

export const metadata: Metadata = {
  title: {
    absolute: "About Us | Panditji Restaurant Khajurikala, Bhopal",
  },
  description:
    "Discover the story of Panditji Restaurant in Khajurikala, Bhopal. Authentic traditional recipes, pure desi ghee preparations, clay tandoor, and warm family hospitality.",
  alternates: {
    canonical: "https://panditjirestaurant.com/about",
  },
  openGraph: {
    title: "About Us | Panditji Restaurant Khajurikala, Bhopal",
    description:
      "Discover the story of Panditji Restaurant in Khajurikala, Bhopal. Authentic traditional recipes, pure desi ghee preparations, clay tandoor, and warm family hospitality.",
    url: "https://panditjirestaurant.com/about",
    siteName: "Panditji Restaurant",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | Panditji Restaurant Khajurikala, Bhopal",
    description:
      "Discover the story of Panditji Restaurant in Khajurikala, Bhopal. Authentic traditional recipes, pure desi ghee preparations, clay tandoor, and warm family hospitality.",
  },
};

export default function AboutPage() {
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
        name: "About Us",
        item: "https://panditjirestaurant.com/about",
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
          <div className="kicker text-[#f5d28d] justify-center">OUR ROOTS & PASSION • PANDITJI RESTAURANT</div>
          <h1 className="font-serif-dhaba font-bold text-2xl sm:text-3xl md:text-4xl mt-2">
            Desi Swad. Apno Wali Feeling.
          </h1>
          <p className="text-xs text-[#cbd8e0] mt-2 max-w-lg mx-auto">
            Honest flavours, hand-ground spices, and traditional recipes served in Khajurikala, Bhopal.
          </p>
        </div>
      </div>
      <AboutSection />
      <TrustStrip />
      <GallerySection />
    </div>
  );
}
