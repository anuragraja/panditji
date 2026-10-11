import React from "react";

export function TrustStrip() {
  const items = [
    { icon: "🥘", title: "Authentic Taste", desc: "Traditional recipes" },
    { icon: "🌿", title: "Fresh Ingredients", desc: "Quality in every bite" },
    { icon: "🔥", title: "Freshly Cooked", desc: "Hot & served fresh" },
    { icon: "🤝", title: "Warm Hospitality", desc: "Family-style service" },
  ];

  return (
    <section className="bg-[#102a43] text-white">
      <div className="container-dhaba grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 py-4 sm:py-[22px]">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-2.5 sm:gap-3 p-2.5 sm:px-4 sm:py-2 rounded-xl bg-white/[0.04] lg:bg-transparent ${
              idx < 3 ? "lg:border-r lg:border-white/10" : ""
            }`}
          >
            <span className="text-2xl sm:text-[27px] select-none shrink-0">{item.icon}</span>
            <div className="min-w-0">
              <b className="block text-xs sm:text-[13px] font-bold text-white truncate">{item.title}</b>
              <span className="block text-[10px] sm:text-[11px] text-[#bdcbd4] mt-0.5 truncate">
                {item.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
