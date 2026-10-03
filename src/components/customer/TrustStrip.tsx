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
      <div className="container-dhaba grid grid-cols-4 max-md:grid-cols-2 max-sm:grid-cols-1 py-[26px]">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-3 px-5 max-md:px-2 max-md:py-2.5 ${
              idx === 0 ? "pl-0" : ""
            } ${idx < 3 ? "border-r border-white/10 max-md:border-none" : ""}`}
          >
            <span className="text-[27px] select-none">{item.icon}</span>
            <div>
              <b className="block text-[13px] font-bold text-white">{item.title}</b>
              <span className="block text-[11px] text-[#bdcbd4] mt-[3px]">
                {item.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
