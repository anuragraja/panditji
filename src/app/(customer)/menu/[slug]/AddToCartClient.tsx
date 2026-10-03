"use client";

import React, { useState } from "react";
import { IMenuItem, IVariant, IAddOn } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Plus, Minus, Check, ShoppingBag } from "lucide-react";

export function AddToCartButtonWithCustomization({ dish }: { dish: IMenuItem }) {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<IVariant | undefined>(
    dish.variants && dish.variants.length > 0 ? dish.variants[0] : undefined
  );
  const [selectedAddOns, setSelectedAddOns] = useState<IAddOn[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState("");

  const currentBasePrice = selectedVariant
    ? selectedVariant.price
    : dish.discountPrice || dish.basePrice;
  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const grandTotal = (currentBasePrice + addOnsTotal) * quantity;

  const toggleAddOn = (addOn: IAddOn) => {
    if (selectedAddOns.some((a) => a.name === addOn.name)) {
      setSelectedAddOns(selectedAddOns.filter((a) => a.name !== addOn.name));
    } else {
      setSelectedAddOns([...selectedAddOns, addOn]);
    }
  };

  const handleAdd = () => {
    addToCart(
      dish,
      selectedVariant,
      selectedAddOns,
      specialInstructions,
      quantity
    );
  };

  return (
    <div className="space-y-5 pt-4 border-t border-[#e9e1d4]">
      {/* Variants */}
      {dish.variants && dish.variants.length > 0 && (
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-[#102a43] mb-2">
            Select Portion
          </label>
          <div className="grid grid-cols-2 gap-2">
            {dish.variants.map((v) => (
              <button
                key={v.name}
                type="button"
                onClick={() => setSelectedVariant(v)}
                className={`p-2.5 rounded-xl border text-xs flex justify-between items-center transition-all ${
                  selectedVariant?.name === v.name
                    ? "border-[#d99a2b] bg-[#f5ead5]/40 text-[#102a43] font-bold"
                    : "border-[#e9e1d4] bg-white text-[#526575]"
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

      {/* Add-ons */}
      {dish.addOns && dish.addOns.length > 0 && (
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-[#102a43] mb-2">
            Customise & Add-ons
          </label>
          <div className="space-y-1.5">
            {dish.addOns.map((addOn) => {
              const isChecked = selectedAddOns.some((a) => a.name === addOn.name);
              return (
                <button
                  key={addOn.name}
                  type="button"
                  onClick={() => toggleAddOn(addOn)}
                  className={`w-full p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
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

      {/* Notes */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider text-[#102a43] mb-1.5">
          Special Request
        </label>
        <input
          type="text"
          placeholder="e.g. Less spicy, without onion / garlic..."
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#ddd8cf] outline-none focus:border-[#d99a2b] bg-white transition-colors"
        />
      </div>

      {/* Quantity & CTA */}
      <div className="flex items-center gap-3 pt-2">
        <div className="flex items-center gap-2 bg-[#fbf7ef] p-1.5 px-3 rounded-xl border border-[#e9e1d4]">
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
          onClick={handleAdd}
          disabled={!dish.available}
          className="flex-1 btn-dhaba btn-dhaba-gold py-3 px-4 text-sm flex items-center justify-between disabled:opacity-50"
        >
          <span className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            <span>Add to Cart</span>
          </span>
          <span>{formatCurrency(grandTotal)}</span>
        </button>
      </div>
    </div>
  );
}
