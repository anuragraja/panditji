import React from "react";
import { AboutSection } from "@/components/customer/AboutSection";
import { TrustStrip } from "@/components/customer/TrustStrip";
import { GallerySection } from "@/components/customer/GallerySection";

export const metadata = {
  title: "About Us | Pandit Ji Ka Dhaba — Our Story & Heritage",
  description:
    "Discover the story of Pandit Ji Ka Dhaba. Authentic Indian food, traditional clay tandoor, pure desi ghee, and warm family hospitality.",
};

export default function AboutPage() {
  return (
    <div className="bg-[#fbf7ef] min-h-screen">
      <div className="bg-[#102a43] text-white py-14">
        <div className="container-dhaba text-center">
          <div className="kicker text-[#f5d28d] justify-center">OUR ROOTS & PASSION</div>
          <h1 className="font-serif-dhaba font-bold text-4xl mt-2">
            Desi Swad. Apno Wali Feeling.
          </h1>
          <p className="text-xs text-[#cbd8e0] mt-2 max-w-lg mx-auto">
            Honest flavours, hand-ground spices, and recipes passed down through generations.
          </p>
        </div>
      </div>
      <AboutSection />
      <TrustStrip />
      <GallerySection />
    </div>
  );
}
