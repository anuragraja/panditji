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
      <div className="container-dhaba py-[100px] max-sm:py-[80px] text-white">
        <div className="kicker">AUTHENTIC INDIAN KITCHEN</div>

        <h1 className="font-serif-dhaba font-extrabold text-[clamp(48px,7vw,82px)] leading-[1.02] my-[18px] mb-[20px] max-w-[800px]">
          Desi Swad.<br />
          <em className="not-italic text-[#f2c35e]">Apno Wali Feeling.</em>
        </h1>

        <p className="max-w-[610px] text-[#e9f0f4] text-[17px] leading-[1.8]">
          {heroSubtitle}
        </p>

        <div className="flex flex-wrap gap-3 mt-[30px]">
          <Link
            href="/#menu"
            className="btn-dhaba btn-dhaba-gold"
          >
            Explore Menu
          </Link>
          <Link
            href="/#contact"
            className="btn-dhaba btn-dhaba-outline"
          >
            Book a Table
          </Link>
        </div>

        <div className="flex gap-[34px] max-sm:gap-[18px] mt-[48px]">
          <div>
            <strong className="block text-[21px] font-bold text-white">4.9 ★</strong>
            <span className="text-[11px] text-[#cbd8e0]">Guest Rating</span>
          </div>
          <div>
            <strong className="block text-[21px] font-bold text-white">15+</strong>
            <span className="text-[11px] text-[#cbd8e0]">Signature Dishes</span>
          </div>
          <div>
            <strong className="block text-[21px] font-bold text-white">100%</strong>
            <span className="text-[11px] text-[#cbd8e0]">Freshly Prepared</span>
          </div>
        </div>
      </div>
    </section>
  );
}
