"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ShoppingBag, User as UserIcon, Menu as MenuIcon, X } from "lucide-react";

export function Navbar() {
  const { totalCount, openCart } = useCart();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#fffdf9]/95 backdrop-blur-md border-b border-[#e9e1d4]">
      <div className="container-dhaba h-[78px] flex items-center justify-between gap-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 text-[#102a43] group">
          <div className="w-[46px] h-[46px] rounded-[14px] bg-[#102a43] text-white flex items-center justify-center font-black text-base border-2 border-[#d99a2b] shadow-brand transition-transform group-hover:scale-105">
            PJ
          </div>
          <div className="flex flex-col">
            <span className="font-serif-dhaba font-extrabold text-[19px] leading-tight text-[#102a43]">
              Pandit Ji
            </span>
            <span className="text-[8px] font-extrabold tracking-[3px] text-[#d99a2b] uppercase">
              KA DHABA
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7">
          <Link
            href="/"
            className="text-[13px] font-bold text-[#526575] hover:text-[#102a43] transition-colors"
          >
            Home
          </Link>
          <Link
            href="/#menu"
            className="text-[13px] font-bold text-[#526575] hover:text-[#102a43] transition-colors"
          >
            Menu
          </Link>
          <Link
            href="/#about"
            className="text-[13px] font-bold text-[#526575] hover:text-[#102a43] transition-colors"
          >
            Our Story
          </Link>
          <Link
            href="/#gallery"
            className="text-[13px] font-bold text-[#526575] hover:text-[#102a43] transition-colors"
          >
            Gallery
          </Link>
          <Link
            href="/#reviews"
            className="text-[13px] font-bold text-[#526575] hover:text-[#102a43] transition-colors"
          >
            Reviews
          </Link>
          <Link
            href="/#contact"
            className="text-[13px] font-bold text-[#526575] hover:text-[#102a43] transition-colors"
          >
            Contact
          </Link>

          {/* Account / Admin / Login Link */}
          {user ? (
            <Link
              href={user.role === "ADMIN" ? "/admin" : "/account"}
              className="flex items-center gap-1.5 text-[12px] font-bold text-[#102a43] bg-[#f5ead5] px-3 py-1.5 rounded-lg border border-[#d99a2b]/30 hover:bg-[#d99a2b] hover:text-white transition-all"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>{user.role === "ADMIN" ? "Admin" : user.name.split(" ")[0]}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-[13px] font-bold text-[#526575] hover:text-[#102a43] transition-colors flex items-center gap-1"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>
          )}
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={openCart}
            aria-label="View Cart"
            className="bg-[#d99a2b] hover:bg-[#b87f1c] text-white px-4 py-2.5 rounded-[11px] font-extrabold text-sm flex items-center gap-2 shadow-[0_8px_18px_rgba(217,154,43,0.22)] transition-all hover:scale-105 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cart</span>
            <span className="bg-white text-[#102a43] px-2 py-0.5 rounded-full text-xs font-black min-w-[20px] text-center">
              {totalCount}
            </span>
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 text-[#102a43] hover:bg-[#f5ead5] rounded-lg transition-colors"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#fffdf9] border-t border-[#e9e1d4] px-6 py-5 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top duration-200">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="text-sm font-bold text-[#172b3a] py-1 border-b border-[#e9e1d4]/40"
          >
            Home
          </Link>
          <Link
            href="/#menu"
            onClick={() => setMobileOpen(false)}
            className="text-sm font-bold text-[#172b3a] py-1 border-b border-[#e9e1d4]/40"
          >
            Menu
          </Link>
          <Link
            href="/#about"
            onClick={() => setMobileOpen(false)}
            className="text-sm font-bold text-[#172b3a] py-1 border-b border-[#e9e1d4]/40"
          >
            Our Story
          </Link>
          <Link
            href="/#gallery"
            onClick={() => setMobileOpen(false)}
            className="text-sm font-bold text-[#172b3a] py-1 border-b border-[#e9e1d4]/40"
          >
            Gallery
          </Link>
          <Link
            href="/#reviews"
            onClick={() => setMobileOpen(false)}
            className="text-sm font-bold text-[#172b3a] py-1 border-b border-[#e9e1d4]/40"
          >
            Reviews
          </Link>
          <Link
            href="/#contact"
            onClick={() => setMobileOpen(false)}
            className="text-sm font-bold text-[#172b3a] py-1 border-b border-[#e9e1d4]/40"
          >
            Contact & Table Booking
          </Link>
          {user ? (
            <Link
              href={user.role === "ADMIN" ? "/admin" : "/account"}
              onClick={() => setMobileOpen(false)}
              className="text-sm font-bold text-[#d99a2b] py-1"
            >
              My Account ({user.name})
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-bold text-[#102a43] py-1"
            >
              Customer / Admin Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
