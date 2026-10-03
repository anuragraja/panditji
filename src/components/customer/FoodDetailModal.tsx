"use client";

import React, { useState } from "react";
import Image from "next/image";
import { IMenuItem, IVariant, IAddOn } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { X, Clock, Plus, Minus, Check } from "lucide-react";

interface FoodDetailModalProps {
  item: IMenuItem | null;
  onClose: () => void;
}

export function FoodDetailModal({ item, onClose }: FoodDetailModalProps) {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<IVariant | undefined>(
    item?.variants && item.variants.length > 0 ? item.variants[0] : undefined
  );
  const [selectedAddOns, setSelectedAddOns] = useState<IAddOn[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState("");

  if (!item) return null;

  const currentBasePrice = selectedVariant
    ? selectedVariant.price
    : item.discountPrice || item.basePrice;
  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = currentBasePrice + addOnsTotal;
  const grandTotal = unitPrice * quantity;

  const toggleAddOn = (addOn: IAddOn) => {
    if (selectedAddOns.some((a) => a.name === addOn.name)) {
      setSelectedAddOns(selectedAddOns.filter((a) => a.name !== addOn.name));
    } else {
      setSelectedAddOns([...selectedAddOns, addOn]);
    }
  };

  const handleAddToCart = () => {
    addToCart(item, selectedVariant, selectedAddOns, instructions, quantity);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="food-modal-title"
      className="fixed inset-0 z-50 bg-[#04111b]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#fffdf9] max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl border border-[#e9e1d4] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header image */}
        <div className="relative h-56 w-full bg-[#102a43]">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 500px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-3 right-3 bg-white/80 hover:bg-white text-[#102a43] p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          {item.tag && (
            <span className="absolute top-3 left-3 bg-white text-[#102a43] text-[10px] font-black px-2.5 py-1 rounded-[7px] shadow-sm">
              {item.tag}
            </span>
          )}
          <div className="absolute bottom-3 left-4 text-white">
            <h3 id="food-modal-title" className="font-serif-dhaba font-bold text-2xl drop-shadow-md">
              {item.name}
            </h3>
            {item.hindiName && (
              <span className="text-xs text-[#f5d28d] font-semibold">
                {item.hindiName}
              </span>
            )}
          </div>
        </div>

        {/* Content body */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
          <p className="text-sm text-[#6c7b87] leading-relaxed">
            {item.description}
          </p>

          <div className="flex items-center gap-4 text-xs font-bold text-[#102a43] bg-[#fbf7ef] p-3 rounded-xl border border-[#e9e1d4]">
            <span className="flex items-center gap-1.5 text-[#d99a2b]">
              <Clock className="w-4 h-4" />
              <span>{item.preparationTime || "15-20 mins"}</span>
            </span>
            <span className="text-[#6c7b87]">•</span>
            <span>Category: {item.category}</span>
            <span className="text-[#6c7b87]">•</span>
            <span
              className={item.available ? "text-[#2d7a52]" : "text-red-500"}
            >
              {item.available ? "Available Now" : "Currently Unavailable"}
            </span>
          </div>

          {/* Variants selection */}
          {item.variants && item.variants.length > 0 && (
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#102a43] mb-2">
                Choose Portion / Variant
              </label>
              <div className="grid grid-cols-2 gap-2">
                {item.variants.map((v) => (
                  <button
                    key={v.name}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`p-3 rounded-xl border text-left flex justify-between items-center transition-all ${
                      selectedVariant?.name === v.name
                        ? "border-[#d99a2b] bg-[#f5ead5]/40 text-[#102a43] font-bold"
                        : "border-[#e9e1d4] bg-white text-[#526575] hover:border-[#d99a2b]/50"
                    }`}
                  >
                    <span>{v.name}</span>
                    <span className="font-extrabold text-[#102a43]">
                      {formatCurrency(v.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons selection */}
          {item.addOns && item.addOns.length > 0 && (
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#102a43] mb-2">
                Add-ons & Extras
              </label>
              <div className="space-y-2">
                {item.addOns.map((addOn) => {
                  const isChecked = selectedAddOns.some(
                    (a) => a.name === addOn.name
                  );
                  return (
                    <button
                      key={addOn.name}
                      type="button"
                      onClick={() => toggleAddOn(addOn)}
                      className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                        isChecked
                          ? "border-[#d99a2b] bg-[#fbf7ef] text-[#102a43] font-bold"
                          : "border-[#e9e1d4] bg-white text-[#526575]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isChecked
                              ? "bg-[#d99a2b] border-[#d99a2b] text-white"
                              : "border-[#e9e1d4]"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{addOn.name}</span>
                      </div>
                      <span className="font-bold text-[#102a43]">
                        +{formatCurrency(addOn.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special instructions */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#102a43] mb-1.5">
              Special Instructions (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Less spicy, extra onions, no butter..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              maxLength={150}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#ddd8cf] outline-none focus:border-[#d99a2b] bg-white transition-colors"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-[#fbf7ef] border-t border-[#e9e1d4] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#e9e1d4]">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-7 h-7 rounded-lg bg-[#eee7da] text-[#102a43] font-bold flex items-center justify-center disabled:opacity-40"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center font-black text-sm text-[#102a43]">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-7 h-7 rounded-lg bg-[#eee7da] text-[#102a43] font-bold flex items-center justify-center"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!item.available}
            className="flex-1 btn-dhaba btn-dhaba-gold py-3 text-sm flex items-center justify-between disabled:opacity-50"
          >
            <span>Add to Cart</span>
            <span>{formatCurrency(grandTotal)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
