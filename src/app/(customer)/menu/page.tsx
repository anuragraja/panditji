import React from "react";
import { getDishes, getCategories } from "@/services/restaurant";
import { MenuSection } from "@/components/customer/MenuSection";

export const metadata = {
  title: "Our Menu | Pandit Ji Ka Dhaba — Authentic Desi Dishes",
  description:
    "Explore our authentic Indian dhaba menu: Paneer Butter Masala, Dal Tadka, Amritsari Chole, Tandoori Breads, Jeera Rice, and Sweet Lassi.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MenuPage() {
  const [dishes, categories] = await Promise.all([
    getDishes(),
    getCategories(),
  ]);

  return (
    <div className="bg-[#fbf7ef] min-h-screen py-8 sm:py-10">
      <div className="container-dhaba mb-6">
        <div className="kicker">AUTHENTIC DHABA MENU</div>
        <h1 className="font-serif-dhaba font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#102a43] mt-2">
          Handcrafted With Traditional Flavours
        </h1>
        <p className="text-sm text-[#6c7b87] mt-1">
          Every dish is prepared hot to order with pure desi ghee and hand-ground spices.
        </p>
      </div>
      <MenuSection initialDishes={dishes} categories={categories} />
    </div>
  );
}
