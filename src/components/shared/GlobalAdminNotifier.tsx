"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { orderAlert } from "@/lib/audio";
import { IOrder } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  Volume2,
  VolumeX,
  X,
  ExternalLink,
  ShieldAlert,
  CheckCircle,
  Loader2,
  BellRing,
} from "lucide-react";

export function GlobalAdminNotifier() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeAlert, setActiveAlert] = useState<IOrder | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSilenced, setIsSilenced] = useState(false);

  const acknowledgedOrderIdsRef = useRef<Set<string>>(new Set());
  const isAdmin = user && user.role === "ADMIN";

  // Hydrate acknowledged order IDs from sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("pj_ack_order_ids");
        if (stored) {
          const list: string[] = JSON.parse(stored);
          list.forEach((id) => acknowledgedOrderIdsRef.current.add(id));
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const markOrderAcknowledged = useCallback((orderId: string) => {
    acknowledgedOrderIdsRef.current.add(orderId);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(
          "pj_ack_order_ids",
          JSON.stringify(Array.from(acknowledgedOrderIdsRef.current))
        );
      } catch {
        // ignore
      }
    }
  }, []);

  // Request system notification permission on admin login
  useEffect(() => {
    if (isAdmin && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, [isAdmin]);

  // Listen to order confirmation events across other components / tabs
  useEffect(() => {
    const handleOrderConfirmed = (e: Event) => {
      const customEvent = e as CustomEvent<{ orderId?: string }>;
      const confirmedId = customEvent.detail?.orderId;
      if (confirmedId) {
        markOrderAcknowledged(confirmedId);
        if (activeAlert?._id === confirmedId) {
          orderAlert.stopAlarm();
          setActiveAlert(null);
        }
      } else {
        orderAlert.stopAlarm();
      }
    };

    window.addEventListener("pj_order_confirmed", handleOrderConfirmed);
    return () => {
      window.removeEventListener("pj_order_confirmed", handleOrderConfirmed);
    };
  }, [activeAlert, markOrderAcknowledged]);

  // Global background order poller for admin device across all pages
  useEffect(() => {
    if (!isAdmin) {
      orderAlert.stopAlarm();
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
          const orders: IOrder[] = data.orders;

          // If current active alert order has been confirmed/cancelled elsewhere, silence & dismiss
          if (activeAlert) {
            const currentActive = orders.find((o) => o._id === activeAlert._id);
            if (!currentActive || currentActive.orderStatus !== "PENDING") {
              orderAlert.stopAlarm();
              if (isMounted) {
                setActiveAlert(null);
              }
              return;
            }
          }

          // Look for any unacknowledged PENDING order
          const unhandledOrder = orders.find(
            (o) =>
              o.orderStatus === "PENDING" &&
              !acknowledgedOrderIdsRef.current.has(o._id)
          );

          if (unhandledOrder) {
            if (isMounted) {
              setActiveAlert(unhandledOrder);
              setIsSilenced(false);

              // Ring repeating kitchen alarm until confirmed
              orderAlert.startAlarm();

              // Send native push notification
              if (
                typeof window !== "undefined" &&
                "Notification" in window &&
                Notification.permission === "granted"
              ) {
                try {
                  new Notification("🔔 New Order Received! #" + unhandledOrder.orderNumber, {
                    body: `${unhandledOrder.customerSnapshot?.name} placed an order for ${formatCurrency(
                      unhandledOrder.total
                    )} (${unhandledOrder.items.length} items)`,
                    icon: "/images/logo.png",
                    tag: unhandledOrder.orderNumber,
                  });
                } catch {
                  // ignore
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Global admin order poller error:", err);
      }
    }

    // Run immediate check
    checkNewOrders();

    // Poll every 6 seconds for swift kitchen alert
    const interval = setInterval(checkNewOrders, 6000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isAdmin, activeAlert]);

  // Action: Confirm order directly from notification box and turn sound off
  const handleConfirmOrder = async () => {
    if (!activeAlert) return;
    setIsConfirming(true);

    // Instantly silence the alarm sound
    orderAlert.stopAlarm();
    setIsSilenced(true);

    try {
      const res = await fetch(`/api/orders/${activeAlert._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: "CONFIRMED" }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to confirm order");
      }

      showToast(`Order #${activeAlert.orderNumber} confirmed! Sound silenced.`);
      markOrderAcknowledged(activeAlert._id);

      // Notify any other listeners (orders table, etc.)
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("pj_order_confirmed", {
            detail: { orderId: activeAlert._id },
          })
        );
      }

      setActiveAlert(null);
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "Failed to confirm order");
    } finally {
      setIsConfirming(false);
    }
  };

  // Action: Silence sound only (leave alert visible for inspection)
  const handleSilenceAlarm = () => {
    orderAlert.stopAlarm();
    setIsSilenced(true);
  };

  // Action: Dismiss notification and stop alarm
  const handleDismiss = () => {
    if (activeAlert) {
      markOrderAcknowledged(activeAlert._id);
    }
    orderAlert.stopAlarm();
    setActiveAlert(null);
  };

  // Action: Open order in Admin Orders page
  const handleOpenOrder = () => {
    if (activeAlert) {
      markOrderAcknowledged(activeAlert._id);
    }
    orderAlert.stopAlarm();
    setActiveAlert(null);
    router.push("/admin/orders");
  };

  if (!isAdmin || !activeAlert) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-5 right-4 sm:right-6 z-[99999] max-w-md w-[calc(100%-2rem)] bg-[#102a43] text-white p-5 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.65)] border-2 border-[#d99a2b] animate-in slide-in-from-top-4 duration-300 backdrop-blur-md"
    >
      {/* Top Bar: Icon, Header & Dismiss */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#d99a2b] text-[#102a43] flex items-center justify-center font-black text-2xl shadow-lg shrink-0 animate-bounce">
            <BellRing className="w-6 h-6 text-[#102a43]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black tracking-widest text-[#f2c35e] uppercase flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-[#f2c35e]" />
                <span>NEW ORDER RECEIVED</span>
              </span>
              {!isSilenced && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black animate-pulse">
                  ALARM RINGING
                </span>
              )}
            </div>

            <h4 className="font-serif-dhaba font-bold text-lg text-white leading-tight mt-0.5">
              Order #{activeAlert.orderNumber}
            </h4>
            <p className="text-xs text-[#cbd8e0] mt-0.5 font-medium">
              <span className="text-white font-bold">{activeAlert.customerSnapshot?.name}</span> •{" "}
              {activeAlert.items.length} item(s) •{" "}
              <strong className="text-[#f2c35e] font-black text-sm">
                {formatCurrency(activeAlert.total)}
              </strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
          title="Dismiss alert and stop sound"
          aria-label="Dismiss alert and stop sound"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Items Preview */}
      <div className="mt-3 py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#dce6ed]">
        <div className="line-clamp-2">
          {activeAlert.items.map((it) => `${it.quantity}x ${it.name}`).join(", ")}
        </div>
      </div>

      {/* Action Buttons: Confirm & Silence, Silence Alarm, View Order */}
      <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Main Action: Confirm Order (Sound Off) */}
        <button
          type="button"
          disabled={isConfirming}
          onClick={handleConfirmOrder}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2d7a52] hover:bg-[#236342] text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
        >
          {isConfirming ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Confirming...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 text-white" />
              <span>Confirm (Sound Off)</span>
            </>
          )}
        </button>

        <div className="flex items-center justify-between gap-2">
          {/* Silence Sound button */}
          {!isSilenced ? (
            <button
              type="button"
              onClick={handleSilenceAlarm}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#f2c35e] font-bold text-xs transition-colors"
              title="Stop alarm sound without confirming yet"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>Silence</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsSilenced(false);
                orderAlert.playOrderChime();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs transition-colors"
              title="Replay alarm sound"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>
          )}

          {/* View Details link */}
          <button
            type="button"
            onClick={handleOpenOrder}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#d99a2b] hover:bg-[#b87f1c] text-[#102a43] font-black text-xs shadow-md transition-all active:scale-95"
          >
            <span>View</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
