"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { X, Trash2, ArrowRight } from "lucide-react";

export function CartDrawer() {
  const { isCartOpen, closeCart, items, updateQuantity, removeItem, subtotal } =
    useCart();

  if (!isCartOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
      className="fixed inset-0 bg-[#04111b]/65 z-50 flex justify-end backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
      onClick={closeCart}
    >
      <aside
        className="w-full max-w-[450px] h-full bg-[#fffdf9] p-[30px] flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex justify-between items-center pb-2">
            <h2 id="cart-drawer-title" className="font-serif-dhaba font-bold text-[31px] text-[#102a43]">
              Your Cart
            </h2>
            <button
              onClick={closeCart}
              aria-label="Close cart"
              className="bg-[#f0ece4] text-[#102a43] hover:bg-[#e4ded3] w-[35px] h-[35px] rounded-full flex items-center justify-center font-black text-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart items list */}
          <div className="divide-y divide-[#e9e1d4] mt-3">
            {items.length === 0 ? (
              <div className="text-[#6c7b87] py-[40px] text-center text-[13px] space-y-3">
                <span className="text-4xl block">🍽️</span>
                <p>Your cart is empty. Add your favourite dishes from the menu.</p>
                <Link
                  href="/#menu"
                  onClick={closeCart}
                  className="inline-block text-[#d99a2b] font-bold underline"
                >
                  Browse Menu →
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex gap-[12px] items-center py-[15px]">
                  <div className="w-[48px] h-[48px] rounded-[10px] bg-[#f5ead5] flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <span className="text-[26px]">🍽️</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <b className="text-[#102a43] text-sm block truncate">
                        {item.name}
                      </b>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[#6c7b87] hover:text-red-500 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.selectedVariant && (
                      <span className="text-[11px] text-[#246b9b] font-semibold block">
                        Portion: {item.selectedVariant.name}
                      </span>
                    )}

                    {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                      <span className="text-[10px] text-[#9a6714] block">
                        + {item.selectedAddOns.map((a) => a.name).join(", ")}
                      </span>
                    )}

                    {item.specialInstructions && (
                      <span className="text-[10px] text-[#6c7b87] italic block truncate">
                        Note: {item.specialInstructions}
                      </span>
                    )}

                    <div className="flex items-center gap-[7px] mt-[6px]">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="border-0 bg-[#eee7da] hover:bg-[#e1d8c8] text-[#102a43] w-[25px] h-[25px] rounded-[6px] font-black flex items-center justify-center text-sm transition-colors cursor-pointer"
                      >
                        −
                      </button>
                      <span className="text-xs font-black text-[#102a43] min-w-[16px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="border-0 bg-[#eee7da] hover:bg-[#e1d8c8] text-[#102a43] w-[25px] h-[25px] rounded-[6px] font-black flex items-center justify-center text-sm transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <b className="text-[#102a43] text-sm font-black whitespace-nowrap">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </b>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Actions */}
        {items.length > 0 && (
          <div className="pt-4 border-t border-[#e9e1d4]">
            <div className="flex justify-between items-center text-[18px] pb-4">
              <span className="text-[#172b3a] font-semibold">Subtotal</span>
              <b className="text-[#102a43] font-black">{formatCurrency(subtotal)}</b>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn-dhaba btn-dhaba-gold w-full flex items-center justify-center gap-2 py-3.5 text-sm"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="text-[11px] text-center text-[#6c7b87] mt-3">
              Taxes and delivery calculated at checkout
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
