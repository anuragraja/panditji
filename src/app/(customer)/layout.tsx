import React from "react";
import { Navbar } from "@/components/customer/Navbar";
import { Footer } from "@/components/customer/Footer";
import { CartDrawer } from "@/components/customer/CartDrawer";
import { StickyMobileCartBar } from "@/components/customer/StickyMobileCartBar";
import { RestaurantJsonLd } from "@/components/shared/RestaurantJsonLd";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <RestaurantJsonLd />
      <Navbar />
      <main className="flex-1">{children}</main>
      <CartDrawer />
      <StickyMobileCartBar />
      <Footer />
    </div>
  );
}
