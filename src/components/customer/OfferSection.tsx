"use client";

import React from "react";
import { IMenuItem } from "@/types";
import { useCart } from "@/context/CartContext";

interface OfferSectionProps {
  comboDish?: IMenuItem | null;
}

export function OfferSection({ comboDish }: OfferSectionProps) {
  const { addToCart } = useCart();

  const handleAddCombo = () => {
    if (comboDish) {
      addToCart(comboDish);
    } else {
      // Fallback dish representation
      addToCart({
        _id: "combo-family-default",
        name: "Family Meal Combo",
        hindiName: "फैमिली स्पेशल कॉम्बो",
        slug: "family-meal-combo",
        description: "Dal Tadka • Paneer Curry • 4 Butter Rotis • Jeera Rice • Salad",
        category: "Combos",
        image: "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=900&q=85",
        foodType: "VEG",
        basePrice: 449,
        available: true,
        featured: true,
        popular: true,
        todaySpecial: true,
      });
    }
  };

  return (
    <section className="bg-[#fbf7ef] pb-[94px]">
      <div className="container-dhaba">
        <div className="rounded-[22px] bg-gradient-to-r from-[#102a43] to-[#183b5b] text-white p-[38px] px-[42px] max-md:p-6 flex justify-between items-center max-md:block shadow-dhaba">
          <div>
            <div className="eyebrow text-[#f5d28d]">CHEF&apos;S FAMILY COMBO</div>
            <h3 className="font-serif-dhaba font-bold text-[30px] max-sm:text-[24px] mt-[7px]">
              Family Meal — Perfect for Sharing
            </h3>
            <p className="text-[#c9d5dc] text-[13px] mt-[7px]">
              Dal Tadka • Paneer Curry • 4 Butter Rotis • Jeera Rice • Salad
            </p>
          </div>
          <div className="text-right max-md:text-left max-md:mt-[18px]">
            <small className="text-[#c9d5dc] text-xs block">Special price</small>
            <strong className="block text-[34px] font-bold text-[#f2c35e] mb-[9px]">
              ₹449
            </strong>
            <button
              onClick={handleAddCombo}
              className="btn-dhaba btn-dhaba-gold cursor-pointer"
            >
              Add Combo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
