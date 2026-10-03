"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { orderAlert } from "@/lib/audio";
import { IOrder } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Bell, Volume2, X, ExternalLink, ShieldAlert } from "lucide-react";

export function GlobalAdminNotifier() {
  const { user } = useAuth();
  const [activeAlert, setActiveAlert] = useState<IOrder | null>(null);
  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  const isAdmin = user && user.role === "ADMIN";

  // Request system notification permission on admin login
  useEffect(() => {
    if (isAdmin && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, [isAdmin]);

  // Global background order poller for admin device
  useEffect(() => {
    if (!isAdmin) {
      setActiveAlert(null);
      return;
    }

    let isMounted = true;

    async function checkNewOrders() {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) return;
        const data = await res.json();

        if (data.success && Array.isArray(data.orders)) {
          const currentOrders: IOrder[] = data.orders;

          // First load: snapshot existing orders so we only alert for NEW incoming orders
          if (isFirstLoadRef.current) {
            currentOrders.forEach((o) => knownOrderIdsRef.current.add(o._id));
            isFirstLoadRef.current = false;
            return;
          }

          // Check for newly arrived orders
          for (const order of currentOrders) {
            if (!knownOrderIdsRef.current.has(order._id)) {
              knownOrderIdsRef.current.add(order._id);

              if (order.orderStatus === "PENDING" || order.orderStatus === "CONFIRMED") {
                if (isMounted) {
                  // 1. Play strong piercing kitchen alarm chime
                  orderAlert.playOrderChime();

                  // 2. Display floating high-priority alert card
                  setActiveAlert(order);

                  // 3. Native system push notification (shows even if tab is in background)
                  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                    try {
                      new Notification("🔔 New Order Received! #" + order.orderNumber, {
                        body: `${order.customerSnapshot?.name} placed an order for ${formatCurrency(order.total)} (${order.items.length} items)`,
                        icon: "/images/logo.png",
                        tag: order.orderNumber,
                      });
                    } catch {
                      // fallback silently
                    }
                  }
                }
                break;
              }
            }
          }
        }
      } catch (err) {
        console.error("Global admin order poller error:", err);
      }
    }

    // Run initial poll
    checkNewOrders();

    // Poll every 8 seconds
    const interval = setInterval(checkNewOrders, 8000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isAdmin]);

  if (!isAdmin || !activeAlert) return null;

  return (
    <div className="fixed top-6 right-6 z-[9999] max-w-md w-[calc(100%-3rem)] bg-[#102a43] text-white p-5 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] border-2 border-[#d99a2b] animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#d99a2b] text-[#102a43] flex items-center justify-center font-black text-2xl shadow-lg shrink-0 animate-bounce">
            🔔
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest text-[#f2c35e] uppercase flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-[#f2c35e]" />
              <span>NEW INCOMING ORDER!</span>
            </span>
            <h4 className="font-serif-dhaba font-bold text-lg text-white leading-tight">
              Order #{activeAlert.orderNumber}
            </h4>
            <p className="text-xs text-[#cbd8e0] mt-1 font-medium">
              {activeAlert.customerSnapshot?.name} • {activeAlert.items.length} item(s) •{" "}
              <strong className="text-[#f2c35e] font-black text-sm">
                {formatCurrency(activeAlert.total)}
              </strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveAlert(null)}
          className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
          title="Dismiss alert"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => orderAlert.playOrderChime()}
          className="text-xs font-bold text-[#f2c35e] hover:underline flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-white/5"
        >
          <Volume2 className="w-4 h-4" />
          <span>Replay Chime & Vibration</span>
        </button>

        <Link
          href="/admin/orders"
          onClick={() => setActiveAlert(null)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#d99a2b] hover:bg-[#b87f1c] text-[#102a43] font-black text-xs shadow-md transition-all active:scale-95"
        >
          <span>Open Order</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
