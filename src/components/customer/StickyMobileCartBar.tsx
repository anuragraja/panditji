"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag, ArrowRight } from "lucide-react";

export function StickyMobileCartBar() {
  const { totalCount, subtotal, openCart } = useCart();

  if (totalCount === 0) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 p-3 bg-gradient-to-t from-[#102a43] via-[#102a43]/95 to-transparent pointer-events-none">
      <div className="container-dhaba pointer-events-auto">
        <button
          onClick={openCart}
          className="w-full bg-[#d99a2b] hover:bg-[#b87f1c] text-white p-3.5 px-5 rounded-2xl flex items-center justify-between shadow-2xl active:scale-[0.99] transition-transform border border-white/20"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#102a43] flex items-center justify-center text-white">
              <ShoppingBag className="w-4 h-4 text-[#f2c35e]" />
            </span>
            <div className="text-left">
              <span className="text-xs font-black tracking-wide block">
                {totalCount} {totalCount === 1 ? "item" : "items"} | {formatCurrency(subtotal)}
              </span>
              <span className="text-[10px] text-white/80 font-medium block">
                Delivery or Self-Pickup
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-black bg-white/20 px-3 py-1.5 rounded-xl">
            <span>View Cart</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>
    </div>
  );
}
