"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Bell, ShieldCheck, Volume2, VolumeX, AlertCircle, X, ExternalLink } from "lucide-react";
import { orderAlert } from "@/lib/audio";
import { IOrder } from "@/types";
import { formatCurrency } from "@/lib/utils";

export function AdminTopbar() {
  const { user } = useAuth();
  const [isMuted, setIsMuted] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState<IOrder | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  // Initialize sound mute state
  useEffect(() => {
    setIsMuted(orderAlert.getMuted());
  }, []);

  const handleToggleSound = () => {
    const muted = orderAlert.toggleMute();
    setIsMuted(muted);
  };

  // Poll for new kitchen orders every 10 seconds
  useEffect(() => {
    let isMounted = true;

    async function checkNewOrders() {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) return;
        const data = await res.json();

        if (data.success && Array.isArray(data.orders)) {
          const currentOrders: IOrder[] = data.orders;

          // First load: initialize known IDs without alerting
          if (isFirstLoadRef.current) {
            currentOrders.forEach((o) => knownOrderIdsRef.current.add(o._id));
            isFirstLoadRef.current = false;
            return;
          }

          // Subsequent polls: check for newly arrived orders
          for (const order of currentOrders) {
            if (!knownOrderIdsRef.current.has(order._id)) {
              knownOrderIdsRef.current.add(order._id);

              // If order is new/pending or confirmed
              if (order.orderStatus === "PENDING" || order.orderStatus === "CONFIRMED") {
                if (isMounted) {
                  // Ring the kitchen order bell!
                  orderAlert.playOrderChime();
                  setNewOrderAlert(order);
                  setUnreadCount((c) => c + 1);
                }
                break; // Alert the most recent one
              }
            }
          }
        }
      } catch (err) {
        console.error("Error polling new orders:", err);
      }
    }

    // Initial check
    checkNewOrders();

    // Poll every 10 seconds
    const interval = setInterval(checkNewOrders, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <header className="h-16 bg-white border-b border-[#e9e1d4] px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="font-serif-dhaba font-bold text-sm text-[#102a43]">
            Kitchen & Restaurant Management
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
            onClick={() => setUnreadCount(0)}
            className="relative p-2 text-[#6c7b87] hover:text-[#102a43] rounded-lg transition-colors cursor-pointer"
            title="View Orders"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 ? (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-600 text-white text-[9px] font-black rounded-full px-1 flex items-center justify-center animate-pulse">
                {unreadCount}
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

      {/* Floating Kitchen New Order Alert Banner */}
      {newOrderAlert && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-[#102a43] text-white p-4 rounded-2xl shadow-2xl border-2 border-[#d99a2b] animate-bounce transition-all">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#d99a2b] text-[#102a43] flex items-center justify-center font-black shrink-0">
                🔔
              </div>
              <div>
                <span className="text-[10px] font-black tracking-widest text-[#f2c35e] uppercase block">
                  NEW ORDER RECEIVED!
                </span>
                <h4 className="font-serif-dhaba font-bold text-base text-white">
                  Order #{newOrderAlert.orderNumber}
                </h4>
                <p className="text-xs text-[#cbd8e0] mt-0.5">
                  {newOrderAlert.customerSnapshot?.name} • {newOrderAlert.items.length} item(s) •{" "}
                  <strong className="text-[#f2c35e]">{formatCurrency(newOrderAlert.total)}</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setNewOrderAlert(null)}
              className="text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => orderAlert.playOrderChime()}
              className="text-[11px] font-bold text-[#f2c35e] hover:underline flex items-center gap-1"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Replay Chime
            </button>

            <Link
              href="/admin/orders"
              onClick={() => setNewOrderAlert(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d99a2b] text-[#102a43] font-black text-xs hover:bg-[#e6a839] transition-colors"
            >
              <span>View Order</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
