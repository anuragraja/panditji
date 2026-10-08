"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Bell, ShieldCheck, Volume2, VolumeX, Menu } from "lucide-react";
import { orderAlert } from "@/lib/audio";
import { IOrder } from "@/types";

import { getCachedData, setCachedData } from "@/lib/client-cache";

interface AdminTopbarProps {
  onToggleSidebar?: () => void;
}

export function AdminTopbar({ onToggleSidebar }: AdminTopbarProps) {
  const { user } = useAuth();
  const [isMuted, setIsMuted] = useState(false);
  const [pendingCount, setPendingCount] = useState(() => {
    const cached = getCachedData<IOrder[]>("admin_orders");
    if (cached) {
      return cached.filter((o: IOrder) => o.orderStatus === "PENDING").length;
    }
    return 0;
  });

  // Initialize sound mute state
  useEffect(() => {
    setIsMuted(orderAlert.getMuted());
  }, []);

  const handleToggleSound = () => {
    const muted = orderAlert.toggleMute();
    setIsMuted(muted);
  };

  // Poll for pending orders count for topbar badge (sound is handled globally by GlobalAdminNotifier)
  useEffect(() => {
    let isMounted = true;

    async function fetchPendingCount() {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) return;
        const data = await res.json();

        if (data.success && Array.isArray(data.orders)) {
          setCachedData("admin_orders", data.orders);
          const count = data.orders.filter(
            (o: IOrder) => o.orderStatus === "PENDING"
          ).length;
          if (isMounted) {
            setPendingCount(count);
          }
        }
      } catch (err) {
        console.error("Error fetching pending order count in topbar:", err);
      }
    }

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="h-16 bg-white border-b border-[#e9e1d4] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-[#102a43] hover:bg-[#f5ead5] rounded-xl transition-colors"
          aria-label="Open navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="font-serif-dhaba font-bold text-sm text-[#102a43] hidden sm:inline">
          Kitchen & Restaurant Management
        </span>
        <span className="font-serif-dhaba font-bold text-sm text-[#102a43] sm:hidden">
          Kitchen
        </span>
        <span className="text-[10px] bg-green-100 text-green-800 font-black px-2 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
          Live
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Sound Alert Toggle */}
        <button
          type="button"
          onClick={handleToggleSound}
          title={isMuted ? "Sound alerts muted. Click to enable." : "Sound alerts active. Click to test / mute."}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
            isMuted
              ? "bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200"
              : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 shadow-sm"
          }`}
        >
          {isMuted ? (
            <>
              <VolumeX className="w-4 h-4 text-gray-500" />
              <span className="hidden sm:inline">Sound: OFF</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-[#d99a2b] animate-bounce" />
              <span className="hidden sm:inline">Sound: ON</span>
            </>
          )}
        </button>

        {/* Notification Bell */}
        <Link
          href="/admin/orders"
          className="relative p-2 text-[#6c7b87] hover:text-[#102a43] rounded-lg transition-colors cursor-pointer"
          title="View Orders"
        >
          <Bell className="w-5 h-5" />
          {pendingCount > 0 ? (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-600 text-white text-[9px] font-black rounded-full px-1 flex items-center justify-center animate-pulse">
              {pendingCount}
            </span>
          ) : (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#d99a2b] rounded-full" />
          )}
        </Link>

        {/* Admin profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-[#e9e1d4]">
          <div className="w-8 h-8 rounded-full bg-[#102a43] text-[#f2c35e] font-serif-dhaba font-bold flex items-center justify-center text-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : "P"}
          </div>
          <div className="hidden sm:block text-left">
            <b className="block text-xs font-bold text-[#102a43] leading-none">
              {user?.name || "Admin"}
            </b>
            <span className="text-[10px] text-[#2d7a52] font-semibold flex items-center gap-0.5 mt-0.5">
              <ShieldCheck className="w-3 h-3" />
              <span>Full Access</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
