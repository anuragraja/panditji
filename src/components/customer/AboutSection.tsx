import React from "react";

export function AboutSection() {
  return (
    <section className="section py-[94px] max-sm:py-[68px]" id="about">
      <div className="container-dhaba grid grid-cols-2 max-md:grid-cols-1 gap-[72px] max-md:gap-[35px] items-center">
        {/* Photo with Since badge */}
        <div
          className="h-[480px] max-sm:h-[360px] rounded-[23px] relative bg-cover bg-center shadow-lg"
          style={{
            backgroundImage: `linear-gradient(0deg, rgba(16, 42, 67, 0.6) 0%, transparent 60%), url("https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=1000&q=88")`,
          }}
        >
          <div className="absolute right-5 bottom-5 bg-white text-[#102a43] p-[15px_20px] rounded-[13px] text-center text-[11px] font-extrabold shadow-brand">
            SERVING WITH LOVE
            <strong className="block font-serif-dhaba font-bold text-[24px] text-[#d99a2b]">
              SINCE 2026
            </strong>
          </div>
        </div>

        {/* Copy */}
        <div>
          <div className="eyebrow">OUR STORY</div>
          <h2 className="font-serif-dhaba font-extrabold text-[43px] max-sm:text-[35px] leading-[1.12] text-[#102a43] mt-[9px]">
            A Taste That Feels <span className="text-[#246b9b]">Like Home.</span>
          </h2>
          <p className="text-[#6c7b87] text-[14px] leading-[1.85] my-5">
            Pandit Ji Ka Dhaba is built around one simple idea: serve honest Indian food with the warmth of home. Every
            dish is prepared with familiar spices, fresh ingredients and time-tested flavours.
          </p>
          <div className="grid gap-[11px] text-[13px] font-bold text-[#3d5362]">
            <div className="flex items-center gap-2">
              <span className="text-[#9a6714] font-black">✓</span>
              <span>Freshly prepared to order</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#9a6714] font-black">✓</span>
              <span>Quality ingredients & hygienic preparation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#9a6714] font-black">✓</span>
              <span>Traditional Indian flavours</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#9a6714] font-black">✓</span>
              <span>Friendly, family-style hospitality</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
