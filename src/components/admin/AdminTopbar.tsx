"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Bell, ShieldCheck } from "lucide-react";

export function AdminTopbar() {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-[#e9e1d4] px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="font-serif-dhaba font-bold text-sm text-[#102a43]">
          Kitchen & Restaurant Management
        </span>
        <span className="text-[10px] bg-green-100 text-green-800 font-black px-2 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
          Live
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative p-2 text-[#6c7b87] hover:text-[#102a43] rounded-lg transition-colors cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#d99a2b] rounded-full" />
        </div>

        {/* Admin profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-[#e9e1d4]">
          <div className="w-8 h-8 rounded-full bg-[#102a43] text-[#f2c35e] font-serif-dhaba font-bold flex items-center justify-center text-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
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
