import React from "react";
import type { Metadata } from "next";
import { Hero } from "@/components/customer/Hero";
import { TrustStrip } from "@/components/customer/TrustStrip";
import { MenuSection } from "@/components/customer/MenuSection";
import { OfferSection } from "@/components/customer/OfferSection";
import { AboutSection } from "@/components/customer/AboutSection";
import { GallerySection } from "@/components/customer/GallerySection";
import { ReviewsSection } from "@/components/customer/ReviewsSection";
import { ContactBookingSection } from "@/components/customer/ContactBookingSection";
import {
  getDishes,
  getCategories,
  getSettings,
  getApprovedReviews,
} from "@/services/restaurant";

export const metadata: Metadata = {
  title: {
    absolute: "Panditji Restaurant | Restaurant in Khajurikala, Bhopal",
  },
  description:
    "Discover Panditji Restaurant in Khajurikala, Bhopal. Explore our menu, view food photos, check opening hours and find directions to visit us.",
  alternates: {
    canonical: "https://panditjirestaurant.com",
  },
  openGraph: {
    title: "Panditji Restaurant | Restaurant in Khajurikala, Bhopal",
    description:
      "Discover Panditji Restaurant in Khajurikala, Bhopal. Explore our menu, view food photos, check opening hours and find directions to visit us.",
    url: "https://panditjirestaurant.com",
    siteName: "Panditji Restaurant",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/logo.png",
        width: 800,
        height: 800,
        alt: "Panditji Restaurant Khajurikala Bhopal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Panditji Restaurant | Restaurant in Khajurikala, Bhopal",
    description:
      "Discover Panditji Restaurant in Khajurikala, Bhopal. Explore our menu, view food photos, check opening hours and find directions to visit us.",
    images: ["/images/logo.png"],
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [dishes, categories, settings, reviews] = await Promise.all([
    getDishes(),
    getCategories(),
    getSettings(),
    getApprovedReviews(),
  ]);

  const comboDish =
    dishes.find((d) => d.slug === "family-meal-combo" && d.available) ||
    dishes.find((d) => d.category === "Combos" && d.available) ||
    null;

  return (
    <>

      <Hero settings={settings} />
      <TrustStrip />
      <MenuSection initialDishes={dishes} categories={categories} />
      <OfferSection comboDish={comboDish} />
      <AboutSection />
      <GallerySection />
      <ReviewsSection reviews={reviews} />
      <ContactBookingSection settings={settings} />
    </>
  );
}
