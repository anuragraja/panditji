import React from "react";
import type { Metadata } from "next";
import { getDishes, getCategories } from "@/services/restaurant";
import { MenuSection } from "@/components/customer/MenuSection";

export const metadata: Metadata = {
  title: {
    absolute: "Menu | Panditji Restaurant Khajurikala, Bhopal",
  },
  description:
    "Explore our authentic Indian food menu at Panditji Restaurant in Khajurikala, Bhopal. Fresh Paneer Butter Masala, Dal Tadka, Amritsari Chole, Tandoori Breads, and combos.",
  alternates: {
    canonical: "https://panditjirestaurant.com/menu",
  },
  openGraph: {
    title: "Menu | Panditji Restaurant Khajurikala, Bhopal",
    description:
      "Explore our authentic Indian food menu at Panditji Restaurant in Khajurikala, Bhopal. Fresh Paneer Butter Masala, Dal Tadka, Amritsari Chole, Tandoori Breads, and combos.",
    url: "https://panditjirestaurant.com/menu",
    siteName: "Panditji Restaurant",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Menu | Panditji Restaurant Khajurikala, Bhopal",
    description:
      "Explore our authentic Indian food menu at Panditji Restaurant in Khajurikala, Bhopal. Fresh Paneer Butter Masala, Dal Tadka, Amritsari Chole, Tandoori Breads, and combos.",
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MenuPage() {
  const [dishes, categories] = await Promise.all([
    getDishes(),
    getCategories(),
  ]);

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://panditjirestaurant.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Menu",
        item: "https://panditjirestaurant.com/menu",
      },
    ],
  };

  return (
    <div className="bg-[#fbf7ef] min-h-screen py-8 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <div className="container-dhaba mb-6">
        <div className="kicker">AUTHENTIC DHABA MENU • PANDITJI RESTAURANT</div>
        <h1 className="font-serif-dhaba font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#102a43] mt-2">
          Handcrafted With Traditional Flavours
        </h1>
        <p className="text-sm text-[#6c7b87] mt-1">
          Every dish is prepared hot to order in Khajurikala, Bhopal with pure desi ghee and hand-ground spices.
        </p>
      </div>
      <MenuSection initialDishes={dishes} categories={categories} />
    </div>
  );
}
