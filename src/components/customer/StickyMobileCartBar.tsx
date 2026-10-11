"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag, ArrowRight } from "lucide-react";

export function StickyMobileCartBar() {
  const pathname = usePathname();
  const { totalCount, subtotal, openCart } = useCart();

  // Hide on cart and checkout pages where cart is already active
  if (totalCount === 0 || pathname === "/cart" || pathname === "/checkout") return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 p-2.5 sm:p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] bg-gradient-to-t from-[#102a43] via-[#102a43]/95 to-transparent pointer-events-none">
      <div className="container-dhaba pointer-events-auto">
        <button
          onClick={openCart}
          className="w-full bg-[#d99a2b] hover:bg-[#b87f1c] text-white p-3 sm:p-3.5 px-3.5 sm:px-5 rounded-2xl flex items-center justify-between gap-2 shadow-2xl active:scale-[0.99] transition-transform border border-white/20"
        >
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-xl bg-[#102a43] flex items-center justify-center text-white shrink-0">
              <ShoppingBag className="w-4 h-4 text-[#f2c35e]" />
            </span>
            <div className="text-left min-w-0">
              <span className="text-xs font-black tracking-wide block truncate">
                {totalCount} {totalCount === 1 ? "item" : "items"} | {formatCurrency(subtotal)}
              </span>
              <span className="text-[10px] text-white/80 font-medium block truncate">
                Delivery or Self-Pickup
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-black bg-white/20 px-2.5 sm:px-3 py-1.5 rounded-xl shrink-0">
            <span>View Cart</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>
    </div>
  );
}

