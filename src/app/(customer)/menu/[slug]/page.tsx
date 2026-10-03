import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/db/mongodb";
import { MenuItem } from "@/models/MenuItem";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, Clock } from "lucide-react";
import { AddToCartButtonWithCustomization } from "./AddToCartClient";
import { fallbackDishes } from "@/services/restaurant";

interface DishPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DishDetailPage({ params }: DishPageProps) {
  const { slug } = await params;
  await connectToDatabase();

  let dish = await MenuItem.findOne({ slug }).lean();
  if (!dish) {
    dish = fallbackDishes.find((d) => d.slug === slug) as never;
  }

  if (!dish) {
    notFound();
  }

  return (
    <div className="bg-[#fbf7ef] min-h-screen py-12">
      <div className="container-dhaba max-w-4xl">
        <Link
          href="/#menu"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#526575] hover:text-[#102a43] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </Link>

        <div className="bg-white rounded-3xl overflow-hidden border border-[#e9e1d4] shadow-dhaba grid grid-cols-1 md:grid-cols-2">
          {/* Photo */}
          <div className="relative h-72 md:h-full min-h-[340px] bg-[#102a43]">
            <Image
              src={dish.image}
              alt={dish.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 500px"
              priority
            />
            {dish.tag && (
              <span className="absolute top-4 left-4 bg-white text-[#102a43] text-xs font-black px-3 py-1.5 rounded-lg shadow-md">
                {dish.tag}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="p-8 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-[11px] font-black tracking-widest text-[#d99a2b] uppercase">
                {dish.category}
              </span>
              <h1 className="font-serif-dhaba font-bold text-3xl text-[#102a43] mt-1">
                {dish.name}
              </h1>
              {dish.hindiName && (
                <span className="text-sm font-semibold text-[#9a6714] block mt-0.5">
                  {dish.hindiName}
                </span>
              )}

              <p className="text-sm text-[#6c7b87] leading-relaxed mt-4">
                {dish.description}
              </p>

              <div className="flex items-center gap-4 text-xs font-bold text-[#102a43] bg-[#fbf7ef] p-3 rounded-xl border border-[#e9e1d4] mt-5">
                <span className="flex items-center gap-1.5 text-[#d99a2b]">
                  <Clock className="w-4 h-4" />
                  <span>{dish.preparationTime || "15-20 mins"}</span>
                </span>
                <span>•</span>
                <span className={dish.available ? "text-[#2d7a52]" : "text-red-500"}>
                  {dish.available ? "Freshly Available" : "Unavailable Today"}
                </span>
              </div>
            </div>

            {/* Interactive Add to Cart & Customization */}
            <AddToCartButtonWithCustomization dish={JSON.parse(JSON.stringify(dish))} />
          </div>
        </div>
      </div>
    </div>
  );
}
