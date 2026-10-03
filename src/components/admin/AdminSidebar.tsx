"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Layers,
  ShoppingBag,
  Users,
  Percent,
  CalendarCheck,
  Star,
  CreditCard,
  BarChart3,
  Globe,
  Settings,
  LogOut,
  ExternalLink,
  X,
} from "lucide-react";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Menu Items", href: "/admin/menu", icon: UtensilsCrossed },
    { name: "Categories", href: "/admin/categories", icon: Layers },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Offers & Coupons", href: "/admin/offers", icon: Percent },
    { name: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
    { name: "Reviews", href: "/admin/reviews", icon: Star },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Reports & Sales", href: "/admin/reports", icon: BarChart3 },
    { name: "Website Content", href: "/admin/website", icon: Globe },
    { name: "Restaurant Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`w-64 bg-[#102a43] text-white flex flex-col justify-between shrink-0 min-h-screen border-r border-[#183b5b] transition-transform duration-200 fixed lg:static inset-y-0 left-0 z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="overflow-y-auto flex-1">
          {/* Brand header */}
          <div className="p-6 border-b border-[#183b5b] flex items-center justify-between">
            <Link href="/admin" onClick={onClose} className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#d99a2b] shadow-brand flex-shrink-0 bg-white">
                <img
                  src="/images/logo.png"
                  alt="Pandit Ji Admin"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-serif-dhaba font-bold text-lg text-white block leading-none">
                  Pandit Ji
                </span>
                <span className="text-[9px] font-extrabold tracking-widest text-[#d99a2b] uppercase">
                  ADMIN PORTAL
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#d99a2b] text-white shadow-md font-black"
                      : "text-[#cbd8e0] hover:bg-[#183b5b] hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-[#183b5b] space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-[#cbd8e0] hover:bg-[#183b5b] hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#d99a2b]" />
              <span>Customer Website</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out Admin</span>
          </button>
        </div>
      </aside>
    </>
  );
}
