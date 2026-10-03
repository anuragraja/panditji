"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, Trash2, ArrowRight, Tag, CheckCircle } from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<{
    code: string;
    discountAmount: number;
    message: string;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [validating, setValidating] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setValidating(true);
    setCouponError("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid coupon");
      }
      setCouponResult({
        code: data.coupon.code,
        discountAmount: data.coupon.discountAmount,
        message: data.message,
      });
    } catch (err: unknown) {
      const error = err as Error;
      setCouponError(error.message || "Invalid coupon");
      setCouponResult(null);
    } finally {
      setValidating(false);
    }
  };

  const discountAmount = couponResult ? couponResult.discountAmount : 0;
  const estimatedDelivery = subtotal >= 499 ? 0 : 30;
  const finalTotal = Math.max(0, subtotal - discountAmount + estimatedDelivery);

  return (
    <div className="bg-[#fbf7ef] min-h-screen py-10">
      <div className="container-dhaba max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/#menu"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#526575] hover:text-[#102a43]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Ordering</span>
          </Link>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-500 hover:text-red-700 font-bold"
            >
              Clear Cart
            </button>
          )}
        </div>

        <h1 className="font-serif-dhaba font-extrabold text-3xl text-[#102a43] mb-6">
          Your Food Cart
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#e9e1d4] shadow-sm space-y-4">
            <span className="text-5xl block">🍛</span>
            <h2 className="font-serif-dhaba font-bold text-2xl text-[#102a43]">
              Your cart is empty
            </h2>
            <p className="text-xs text-[#6c7b87] max-w-sm mx-auto">
              You haven&apos;t added any delicious dhaba items yet. Check out our signature curries and tandoori breads!
            </p>
            <Link href="/#menu" className="btn-dhaba btn-dhaba-gold mt-2">
              Explore Our Menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Items Column */}
            <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-[#e9e1d4] shadow-sm divide-y divide-[#e9e1d4]">
              {items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-[#f5ead5] flex-shrink-0 relative overflow-hidden">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <span className="text-2xl flex items-center justify-center h-full">🍽️</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <b className="text-sm text-[#102a43] block truncate">
                      {item.name}
                    </b>
                    {item.selectedVariant && (
                      <span className="text-[11px] text-[#246b9b] font-semibold block">
                        Portion: {item.selectedVariant.name}
                      </span>
                    )}
                    {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                      <span className="text-[10px] text-[#9a6714] block truncate">
                        + {item.selectedAddOns.map((a) => a.name).join(", ")}
                      </span>
                    )}
                    {item.specialInstructions && (
                      <span className="text-[10px] text-[#6c7b87] italic block truncate">
                        Note: {item.specialInstructions}
                      </span>
                    )}
                    <span className="text-xs font-bold text-[#102a43] mt-1 block">
                      {formatCurrency(item.unitPrice)} each
                    </span>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center gap-2 bg-[#fbf7ef] px-2 py-1 rounded-lg border border-[#e9e1d4]">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 rounded bg-[#eee7da] font-black text-xs flex items-center justify-center text-[#102a43]"
                    >
                      −
                    </button>
                    <span className="w-4 text-center font-black text-xs">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-6 h-6 rounded bg-[#eee7da] font-black text-xs flex items-center justify-center text-[#102a43]"
                    >
                      +
                    </button>
                  </div>

                  <b className="text-sm font-black text-[#102a43] w-16 text-right">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </b>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-[#6c7b87] hover:text-red-500 p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Summary Column */}
            <div className="space-y-4">
              {/* Coupon box */}
              <div className="bg-white rounded-3xl p-5 border border-[#e9e1d4] shadow-sm">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-[#6c7b87] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#ddd8cf] outline-none uppercase font-bold"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={validating || !couponCode}
                    className="btn-dhaba btn-dhaba-gold py-2 px-3 text-xs font-bold disabled:opacity-50"
                  >
                    {validating ? "Checking..." : "Apply"}
                  </button>
                </form>

                {couponResult && (
                  <div className="flex items-center gap-1.5 text-xs text-[#2d7a52] font-bold mt-2">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{couponResult.message}</span>
                  </div>
                )}
                {couponError && (
                  <p className="text-xs text-red-500 font-semibold mt-2">{couponError}</p>
                )}
              </div>

              {/* Bill Details */}
              <div className="bg-white rounded-3xl p-6 border border-[#e9e1d4] shadow-sm space-y-3">
                <h3 className="font-serif-dhaba font-bold text-lg text-[#102a43] pb-2 border-b border-[#e9e1d4]">
                  Bill Summary
                </h3>

                <div className="flex justify-between text-xs text-[#526575]">
                  <span>Item Subtotal</span>
                  <span className="font-bold text-[#102a43]">{formatCurrency(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-[#2d7a52] font-bold">
                    <span>Coupon Discount ({couponResult?.code})</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-xs text-[#526575]">
                  <span>Delivery Partner Fee</span>
                  <span className="font-bold text-[#102a43]">
                    {estimatedDelivery === 0 ? "FREE" : formatCurrency(estimatedDelivery)}
                  </span>
                </div>

                {subtotal < 499 && (
                  <p className="text-[10px] text-[#9a6714] bg-[#fbf7ef] p-2 rounded-lg border border-[#d99a2b]/20">
                    Add ₹{499 - subtotal} more items for <b>FREE Delivery!</b>
                  </p>
                )}

                <div className="pt-3 border-t border-[#e9e1d4] flex justify-between items-center text-base">
                  <span className="font-bold text-[#102a43]">To Pay</span>
                  <span className="font-black text-xl text-[#102a43]">{formatCurrency(finalTotal)}</span>
                </div>

                <Link
                  href="/checkout"
                  className="btn-dhaba btn-dhaba-gold w-full flex items-center justify-center gap-2 py-3.5 text-sm mt-3"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
