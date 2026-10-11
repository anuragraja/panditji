"use client";

import React from "react";
import { IMenuItem } from "@/types";
import { useCart } from "@/context/CartContext";

interface OfferSectionProps {
  comboDish?: IMenuItem | null;
}

export function OfferSection({ comboDish }: OfferSectionProps) {
  const { addToCart } = useCart();

  if (!comboDish) {
    return null;
  }

  const handleAddCombo = () => {
    addToCart(comboDish);
  };

  const specialPrice = comboDish.discountPrice || comboDish.basePrice;
  const tag = comboDish.tag || "CHEF'S FAMILY COMBO";

  return (
    <section className="bg-[#fbf7ef] pb-14 sm:pb-[94px]">
      <div className="container-dhaba">
        <div className="rounded-[22px] bg-gradient-to-r from-[#102a43] to-[#183b5b] text-white p-5 sm:p-8 md:p-[38px] md:px-[42px] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-dhaba">
          <div>
            <div className="eyebrow text-[#f5d28d]">{tag}</div>
            <h3 className="font-serif-dhaba font-bold text-2xl sm:text-[30px] mt-1.5 leading-snug">
              {comboDish.name}
            </h3>
            <p className="text-[#c9d5dc] text-xs sm:text-[13px] mt-1.5 leading-relaxed">
              {comboDish.description}
            </p>
          </div>
          <div className="text-left md:text-right shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t border-white/10 md:border-none">
            <small className="text-[#c9d5dc] text-xs block">Special price</small>
            <strong className="block text-2xl sm:text-[34px] font-bold text-[#f2c35e] mb-2 sm:mb-[9px]">
              ₹{specialPrice}
            </strong>
            <button
              onClick={handleAddCombo}
              className="w-full sm:w-auto btn-dhaba btn-dhaba-gold cursor-pointer text-center"
            >
              Add Combo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
