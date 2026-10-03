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

  const comboDish = dishes.find((d) => d.slug === "family-meal-combo") || null;

  return (
    <>
      {/* Announcement Banner if enabled */}
      {settings?.announcementBanner?.enabled && settings.announcementBanner.text && (
        <div className="bg-[#102a43] text-[#f5d28d] py-2 px-4 text-center text-xs font-bold border-b border-[#d99a2b]/30 flex items-center justify-center gap-2">
          <span>📢</span>
          <span>{settings.announcementBanner.text}</span>
        </div>
      )}

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
