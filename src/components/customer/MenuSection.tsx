"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { IMenuItem, ICategory } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { FoodDetailModal } from "./FoodDetailModal";
import { Search, Sparkles } from "lucide-react";

interface MenuSectionProps {
  initialDishes: IMenuItem[];
  categories: ICategory[];
}

export function MenuSection({ initialDishes, categories }: MenuSectionProps) {
  const [selectedCat, setSelectedCat] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [activeModalItem, setActiveModalItem] = useState<IMenuItem | null>(null);

  const { addToCart } = useCart();

  // Combine category names
  const categoryTabs = ["All", ...categories.map((c) => c.name)];

  const filteredDishes = useMemo(() => {
    return initialDishes.filter((dish) => {
      // Category filter
      const matchesCategory =
        selectedCat === "All" || dish.category === selectedCat;

      // Veg filter
      const matchesVeg = !vegOnly || dish.foodType === "VEG";

      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        dish.name.toLowerCase().includes(q) ||
        (dish.hindiName && dish.hindiName.includes(q)) ||
        dish.description.toLowerCase().includes(q) ||
        dish.category.toLowerCase().includes(q);

      return matchesCategory && matchesVeg && matchesSearch;
    });
  }, [initialDishes, selectedCat, vegOnly, searchQuery]);

  const handleCardAdd = (dish: IMenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    // If the dish has variants or add-ons, open modal so the user can customize
    if (
      (dish.variants && dish.variants.length > 0) ||
      (dish.addOns && dish.addOns.length > 0)
    ) {
      setActiveModalItem(dish);
    } else {
      addToCart(dish);
    }
  };

  return (
    <section className="section bg-[#fbf7ef] py-[94px] max-sm:py-[68px]" id="menu">
      <div className="container-dhaba">
        {/* Section Top Header */}
        <div className="flex justify-between items-end gap-[25px] mb-[35px] max-md:block">
          <div>
            <div className="eyebrow">FROM OUR KITCHEN</div>
            <h2 className="font-serif-dhaba font-extrabold text-[43px] max-sm:text-[35px] leading-[1.12] text-[#102a43] mt-[9px]">
              Our <span className="text-[#246b9b]">Menu</span>
            </h2>
          </div>
          <p className="max-w-[420px] text-[#6c7b87] text-[14px] max-md:mt-3">
            Simple, authentic and carefully prepared dishes — made for a satisfying desi meal.
          </p>
        </div>

        {/* Search and Veg Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          {/* Category Pills */}
          <div className="flex gap-[9px] flex-wrap" id="categories">
            {categoryTabs.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCat(cat)}
                className={`border text-[12px] font-extrabold px-[15px] py-[9px] rounded-[30px] cursor-pointer transition-all ${
                  selectedCat === cat
                    ? "bg-[#102a43] text-white border-[#102a43] shadow-sm"
                    : "border-[#ddd3c4] bg-[#fffaf2] text-[#586b78] hover:bg-[#102a43] hover:text-white hover:border-[#102a43]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quick Search and Veg toggle */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-[#6c7b87] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search dish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-full border border-[#ddd3c4] bg-[#fffaf2] text-[#172b3a] outline-none focus:border-[#d99a2b]"
              />
            </div>
            <button
              type="button"
              onClick={() => setVegOnly(!vegOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-bold transition-all ${
                vegOnly
                  ? "bg-[#2d7a52] text-white border-[#2d7a52]"
                  : "bg-[#fffaf2] text-[#3d5362] border-[#ddd3c4] hover:border-[#2d7a52]"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full border border-current flex items-center justify-center p-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
              </span>
              <span>Pure Veg</span>
            </button>
          </div>
        </div>

        {/* Menu Grid */}
        {filteredDishes.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#e9e1d4] text-[#6c7b87]">
            <p className="text-base font-semibold">No dishes found in this category.</p>
            <p className="text-xs mt-1">Try searching for something else or reset filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-[18px]" id="menuGrid">
            {filteredDishes.map((dish) => (
              <article
                key={dish._id}
                onClick={() => setActiveModalItem(dish)}
                className="food-card bg-white border border-[#e9e1d4] rounded-[18px] p-[13px] shadow-card food-card-hover cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div
                    className="food-img h-[190px] rounded-[13px] relative overflow-hidden bg-cover bg-center"
                    style={{ backgroundImage: `url('${dish.image}')` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    {dish.tag && (
                      <span className="tag absolute z-10 top-[10px] left-[10px] bg-white text-[#102a43] text-[10px] font-black px-[9px] py-[6px] rounded-[7px] shadow-sm">
                        {dish.tag}
                      </span>
                    )}
                    {dish.todaySpecial && (
                      <span className="absolute z-10 top-[10px] right-[10px] bg-[#d99a2b] text-white text-[10px] font-black px-[8px] py-[4px] rounded-[7px] flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-3 h-3" />
                        <span>Special</span>
                      </span>
                    )}
                  </div>

                  <div className="food-info pt-[13px] px-[3px] pb-[4px]">
                    <h3 className="font-serif-dhaba font-bold text-[21px] text-[#102a43] leading-snug group-hover:text-[#246b9b] transition-colors">
                      {dish.name}
                    </h3>
                    {dish.hindiName && (
                      <span className="text-[11px] text-[#9a6714] font-medium block">
                        {dish.hindiName}
                      </span>
                    )}
                    <p className="text-[12px] text-[#6c7b87] min-h-[38px] mt-[5px] line-clamp-2 leading-relaxed">
                      {dish.description}
                    </p>
                  </div>
                </div>

                <div className="food-bottom flex justify-between items-center mt-[12px] pt-2 border-t border-[#e9e1d4]/40">
                  <div className="flex flex-col">
                    <span className="price font-black text-[#102a43] text-[18px]">
                      {formatCurrency(dish.discountPrice || dish.basePrice)}
                    </span>
                    {dish.discountPrice && dish.discountPrice < dish.basePrice && (
                      <span className="text-[11px] text-[#6c7b87] line-through">
                        {formatCurrency(dish.basePrice)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleCardAdd(dish, e)}
                    className="add-btn border-0 bg-[#f5ead5] text-[#9a6714] hover:bg-[#d99a2b] hover:text-white px-[13px] py-[9px] rounded-[9px] text-[12px] font-black cursor-pointer transition-all active:scale-95"
                  >
                    + Add
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Variants & Add-ons */}
      {activeModalItem && (
        <FoodDetailModal
          item={activeModalItem}
          onClose={() => setActiveModalItem(null)}
        />
      )}
    </section>
  );
}
