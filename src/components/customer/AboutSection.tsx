import React from "react";

export function AboutSection() {
  return (
    <section className="section py-14 sm:py-[94px]" id="about">
      <div className="container-dhaba grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-[72px] items-center">
        {/* Photo with Since badge */}
        <div
          className="h-[280px] sm:h-[360px] md:h-[480px] rounded-[23px] relative bg-cover bg-center shadow-lg"
          style={{
            backgroundImage: `linear-gradient(0deg, rgba(16, 42, 67, 0.6) 0%, transparent 60%), url("/images/about-story.jpg")`,
          }}
        >
          <div className="absolute right-3 bottom-3 sm:right-5 sm:bottom-5 bg-white text-[#102a43] p-2.5 sm:p-[15px_20px] rounded-xl text-center text-[10px] sm:text-[11px] font-extrabold shadow-brand">
            SERVING WITH LOVE
            <strong className="block font-serif-dhaba font-bold text-lg sm:text-[24px] text-[#d99a2b]">
              SINCE 2026
            </strong>
          </div>
        </div>

        {/* Copy */}
        <div>
          <div className="eyebrow">OUR STORY</div>
          <h2 className="font-serif-dhaba font-extrabold text-2xl sm:text-4xl lg:text-[43px] leading-tight text-[#102a43] mt-2">
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
