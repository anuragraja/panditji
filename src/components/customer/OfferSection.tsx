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
    <section className="bg-[#fbf7ef] pb-[94px]">
      <div className="container-dhaba">
        <div className="rounded-[22px] bg-gradient-to-r from-[#102a43] to-[#183b5b] text-white p-[38px] px-[42px] max-md:p-6 flex justify-between items-center max-md:block shadow-dhaba">
          <div>
            <div className="eyebrow text-[#f5d28d]">{tag}</div>
            <h3 className="font-serif-dhaba font-bold text-[30px] max-sm:text-[24px] mt-[7px]">
              {comboDish.name}
            </h3>
            <p className="text-[#c9d5dc] text-[13px] mt-[7px]">
              {comboDish.description}
            </p>
          </div>
          <div className="text-right max-md:text-left max-md:mt-[18px]">
            <small className="text-[#c9d5dc] text-xs block">Special price</small>
            <strong className="block text-[34px] font-bold text-[#f2c35e] mb-[9px]">
              ₹{specialPrice}
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
