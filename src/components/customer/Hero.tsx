import React from "react";
import Link from "next/link";
import { IRestaurantSettings } from "@/types";

interface HeroProps {
  settings?: IRestaurantSettings | null;
}

export function Hero({ settings }: HeroProps) {
  const heroImage =
    settings?.heroImage ||
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1900&q=88";

  const heroSubtitle =
    settings?.heroSubtitle ||
    "Fresh ingredients, traditional recipes and the warmth of a true Indian dhaba — served fresh to your table.";

  return (
    <section
      id="home"
      className="relative min-h-[680px] max-sm:min-h-[620px] flex items-center bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(9, 29, 45, 0.93) 0%, rgba(16, 42, 67, 0.78) 48%, rgba(16, 42, 67, 0.28) 100%), url("${heroImage}")`,
      }}
    >
      <div className="container-dhaba py-16 sm:py-[100px] text-white">
        <div className="kicker">AUTHENTIC INDIAN KITCHEN</div>

        <h1 className="font-serif-dhaba font-extrabold text-[clamp(32px,7.5vw,76px)] leading-[1.08] my-4 sm:my-[18px] mb-5 max-w-[800px]">
          Desi Swad.<br />
          <em className="not-italic text-[#f2c35e]">Apno Wali Feeling.</em>
        </h1>

        <p className="max-w-[610px] text-[#e9f0f4] text-sm sm:text-[17px] leading-relaxed sm:leading-[1.8]">
          {heroSubtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-[30px]">
          <Link
            href="/#menu"
            className="btn-dhaba btn-dhaba-gold text-center py-3 sm:py-3.5"
          >
            Explore Menu
          </Link>
          <Link
            href="/#contact"
            className="btn-dhaba btn-dhaba-outline text-center py-3 sm:py-3.5"
          >
            Book a Table
          </Link>
        </div>

        <div className="flex flex-wrap gap-x-5 sm:gap-x-8 gap-y-2 mt-8 sm:mt-[48px]">
          <div>
            <strong className="block text-lg sm:text-[21px] font-bold text-white">4.9 ★</strong>
            <span className="text-[10px] sm:text-[11px] text-[#cbd8e0]">Guest Rating</span>
          </div>
          <div>
            <strong className="block text-lg sm:text-[21px] font-bold text-white">15+</strong>
            <span className="text-[10px] sm:text-[11px] text-[#cbd8e0]">Signature Dishes</span>
          </div>
          <div>
            <strong className="block text-lg sm:text-[21px] font-bold text-white">100%</strong>
            <span className="text-[10px] sm:text-[11px] text-[#cbd8e0]">Freshly Prepared</span>
          </div>
        </div>
      </div>
    </section>
  );
}
