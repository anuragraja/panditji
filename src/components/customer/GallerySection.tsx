import React from "react";

export function GallerySection() {
  const images = [
    {
      id: "g1",
      title: "Traditional Indian Platter",
      url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=85",
      className: "row-span-2 max-sm:row-span-1",
    },
    {
      id: "g2",
      title: "Fresh Tandoor",
      url: "https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=800&q=85",
      className: "",
    },
    {
      id: "g3",
      title: "Desi Favourites",
      url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=85",
      className: "",
    },
    {
      id: "g4",
      title: "Rich Indian Curries",
      url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=85",
      className: "",
    },
    {
      id: "g5",
      title: "Refreshing Drinks",
      url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=85",
      className: "",
    },
  ];

  return (
    <section className="bg-[#f7f3eb] py-[94px] max-sm:py-[68px]" id="gallery">
      <div className="container-dhaba">
        <div className="text-center mb-[35px]">
          <div className="eyebrow">A GLIMPSE FROM OUR KITCHEN</div>
          <h2 className="font-serif-dhaba font-extrabold text-[43px] max-sm:text-[35px] leading-[1.12] text-[#102a43] mt-[9px]">
            Made Fresh. Served <span className="text-[#246b9b]">With Love.</span>
          </h2>
        </div>

        <div className="gallery-grid-custom">
          {images.map((img) => (
            <div
              key={img.id}
              className={`rounded-[16px] bg-center bg-cover relative overflow-hidden group shadow-sm ${img.className}`}
              style={{ backgroundImage: `url('${img.url}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#091d2d]/80 via-transparent to-transparent group-hover:from-[#091d2d]/90 transition-all duration-300" />
              <span className="absolute z-10 left-[16px] bottom-[14px] text-white font-extrabold text-[13px] tracking-wide drop-shadow-md">
                {img.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
