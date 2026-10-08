import React from "react";
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

export const revalidate = 60; // ISR cache revalidation every minute

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
