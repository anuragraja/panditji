"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Bell,
} from "lucide-react";

export function GlobalAdminNotifier() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeAlert, setActiveAlert] = useState<IOrder | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSilenced, setIsSilenced] = useState(false);
  const [showPermissionBanner, setShowPermissionBanner] = useState(false);

  const acknowledgedOrderIdsRef = useRef<Set<string>>(new Set());
  const workerRef = useRef<Worker | null>(null);
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

  // 1. Register Service Worker for mobile background order alerts & action buttons
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Pandit Ji SW registered successfully:", reg.scope);
        })
        .catch((err) => {
          console.warn("Pandit Ji SW registration error:", err);
        });
    }
  }, []);

  // 2. Listen to messages from Service Worker (e.g. user clicked "Confirm" in Android/Desktop OS notification)
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const handleSwMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data && data.type === "PJ_STOP_ALARM") {
        // Immediately silence audio & device vibration
        orderAlert.stopAlarm();
        setIsSilenced(true);

        if (data.orderId) {
          markOrderAcknowledged(data.orderId);
        }

        if (data.confirmed) {
          showToast("Order confirmed directly from notification! Sound stopped.");
          setActiveAlert(null);
          // Broadcast to admin orders page or other listeners
          window.dispatchEvent(
            new CustomEvent("pj_order_confirmed", { detail: { orderId: data.orderId } })
          );
        } else if (activeAlert && activeAlert._id === data.orderId) {
          setActiveAlert(null);
        }
      }
    };

    navigator.serviceWorker.addEventListener("message", handleSwMessage);
    return () => {
      navigator.serviceWorker.removeEventListener("message", handleSwMessage);
    };
  }, [activeAlert, markOrderAcknowledged, showToast]);

  // 3. Check Notification permission for admin device
  useEffect(() => {
    if (isAdmin && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        setShowPermissionBanner(true);
      } else {
        setShowPermissionBanner(false);
      }
    } else {
      setShowPermissionBanner(false);
    }
  }, [isAdmin]);

  const requestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const perm = await Notification.requestPermission();
        if (perm === "granted") {
          setShowPermissionBanner(false);
          showToast("Order notifications & vibration active!");
        } else {
          setShowPermissionBanner(false);
        }
      } catch {
        setShowPermissionBanner(false);
      }
    }
  };

  // 4. Listen to in-app order confirmation events across other components / tabs
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

  // 5. Trigger System Notification on Mobile & Desktop
  const triggerNativeNotification = useCallback(
    async (order: IOrder) => {
      if (typeof window === "undefined") return;

      // Primary: Service Worker showNotification (Supports Android lock screen, mobile vibration & native action buttons)
      if ("serviceWorker" in navigator) {
        try {
          const reg = await navigator.serviceWorker.ready;
          if (reg && reg.showNotification) {
            const swOptions: NotificationOptions & Record<string, unknown> = {
              body: `${order.customerSnapshot?.name} placed order for ${formatCurrency(
                order.total
              )} (${order.items.length} items)`,
              icon: "/images/logo.png",
              badge: "/images/logo.png",
              // Mobile haptic vibration: loud buzz pulses
              vibrate: [600, 250, 600, 250, 1000, 300, 1200],
              tag: `order-${order._id}`,
              renotify: true,
              requireInteraction: true,
              data: {
                orderId: order._id,
                orderNumber: order.orderNumber,
              },
              actions: [
                { action: "confirm", title: "✅ Confirm (Sound Off)" },
                { action: "open", title: "👀 View Order" },
              ],
            };

            await reg.showNotification(
              `🔔 New Order! #${order.orderNumber}`,
              swOptions as NotificationOptions
            );
            return;
          }
        } catch (e) {
          console.warn("SW showNotification error, attempting window fallback:", e);
        }
      }

      // Secondary fallback: Desktop Window Notification
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          const notif = new Notification(`🔔 New Order! #${order.orderNumber}`, {
            body: `${order.customerSnapshot?.name} • ${formatCurrency(order.total)} (${
              order.items.length
            } items)`,
            icon: "/images/logo.png",
            tag: `order-${order._id}`,
            requireInteraction: true,
          });
          notif.onclick = () => {
            orderAlert.stopAlarm();
            window.focus();
            router.push("/admin/orders");
          };
        } catch {
          // ignore
        }
      }
    },
    [router]
  );

  // 6. Global background order checker (using unthrottled Web Worker ticker for background tabs)
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

              // Trigger native device notification with vibration & confirm action
              triggerNativeNotification(unhandledOrder);
            }
          }
        }
      } catch (err) {
        console.error("Global admin order poller error:", err);
      }
    }

    // Run immediate check on mount / login
    checkNewOrders();

    // Create an inline Web Worker ticker to bypass background tab throttling
    try {
      const workerBlob = new Blob(
        [
          `
          let timer = null;
          self.onmessage = function(e) {
            if (e.data === 'start') {
              if (timer) clearInterval(timer);
              timer = setInterval(() => { self.postMessage('tick'); }, 5000);
            } else if (e.data === 'stop') {
              if (timer) clearInterval(timer);
              timer = null;
            }
          };
        `,
        ],
        { type: "application/javascript" }
      );
      const workerUrl = URL.createObjectURL(workerBlob);
      const worker = new Worker(workerUrl);
      workerRef.current = worker;

      worker.onmessage = () => {
        checkNewOrders();
      };
      worker.postMessage("start");
    } catch {
      // Fallback to standard setInterval if Web Worker is restricted
      const interval = setInterval(checkNewOrders, 5000);
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }

    // Listen to tab visibility changes to run an instant sync when switching back
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkNewOrders();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (workerRef.current) {
        workerRef.current.postMessage("stop");
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [isAdmin, activeAlert, triggerNativeNotification]);

  // Action: Confirm order directly from notification box and turn sound off
  const handleConfirmOrder = async () => {
    if (!activeAlert) return;
    setIsConfirming(true);

    // Instantly silence the alarm sound & vibration
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

      showToast(`Order #${activeAlert.orderNumber} confirmed! Sound & vibration stopped.`);
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

  if (!isAdmin) return null;

  return (
    <>
      {/* Permission Request Banner for Admin Device */}
      {showPermissionBanner && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[99998] bg-[#102a43] text-white p-4 rounded-2xl shadow-2xl border-2 border-[#d99a2b] flex items-center justify-between gap-3 animate-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d99a2b] text-[#102a43] flex items-center justify-center font-black shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <b className="text-xs text-white block">Enable Mobile & Sound Alerts</b>
              <p className="text-[11px] text-[#cbd8e0]">
                Receive instant sound, vibration & confirm button on lock screen.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={requestNotificationPermission}
              className="px-3 py-1.5 rounded-xl bg-[#d99a2b] hover:bg-[#b87f1c] text-[#102a43] font-black text-xs shadow transition-all"
            >
              Allow
            </button>
            <button
              type="button"
              onClick={() => setShowPermissionBanner(false)}
              className="p-1 text-gray-400 hover:text-white"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating High-Impact Notification Box */}
      {activeAlert && (
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
                      ALARM & VIBRATION ON
                    </span>
                  )}
                </div>

                <h4 className="font-serif-dhaba font-bold text-lg text-white leading-tight mt-0.5">
                  Order #{activeAlert.orderNumber}
                </h4>
                <p className="text-xs text-[#cbd8e0] mt-0.5 font-medium">
                  <span className="text-white font-bold">{activeAlert.customerSnapshot?.name}</span>{" "}
                  • {activeAlert.items.length} item(s) •{" "}
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
                  title="Stop alarm sound and vibration without confirming yet"
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
      )}
    </>
  );
}
