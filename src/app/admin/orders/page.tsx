"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { IOrder, OrderStatus, IRestaurantSettings } from "@/types";
import { buildAdminStatusMessage, buildWhatsAppUrl } from "@/lib/whatsapp/message-builder";
import { useToast } from "@/context/ToastContext";
import { orderAlert } from "@/lib/audio";
import {
  Search,
  Filter,
  Check,
  Clock,
  Flame,
  Bike,
  CheckCircle,
  XCircle,
  MessageSquare,
  FileText,
  X,
  Copy,
  Printer,
  Banknote,
} from "lucide-react";
import { getCachedData, setCachedData, invalidateCache } from "@/lib/client-cache";

export default function AdminOrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<IOrder[]>(() => {
    return getCachedData<IOrder[]>("admin_orders") || [];
  });
  const [settings, setSettings] = useState<IRestaurantSettings | null>(() => {
    return getCachedData<IRestaurantSettings>("admin_settings") || null;
  });
  const [loading, setLoading] = useState(() => {
    return !getCachedData<IOrder[]>("admin_orders");
  });
  const [, startTransition] = useTransition();

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal active order
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const url = new URL("/api/orders", window.location.origin);
      if (statusFilter !== "ALL") url.searchParams.set("status", statusFilter);
      if (searchQuery) url.searchParams.set("search", searchQuery);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
        if (statusFilter === "ALL" && !searchQuery) {
          setCachedData("admin_orders", data.orders);
        }
      }
    } catch (e) {
      console.error("Error fetching admin orders:", e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchOrders();
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setSettings(d.settings);
          setCachedData("admin_settings", d.settings);
        }
      })
      .catch((e) => console.error(e));
  }, [fetchOrders]);

  const handleUpdatePaymentStatus = async (orderId: string, newPaymentStatus: "PAID" | "PENDING") => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update payment status");
      }

      showToast(
        newPaymentStatus === "PAID"
          ? "Payment marked as Complete (PAID) ✓"
          : "Payment status set to Pending"
      );
      invalidateCache("admin_orders");
      invalidateCache("admin_payments");
      startTransition(() => {
        setSelectedOrder(data.order);
        setOrders((prev) =>
          prev.map((o) => (o._id === data.order._id ? data.order : o))
        );
      });
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "Payment status update error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingStatus(true);

    // If confirming or processing order, turn sound off immediately
    if (newStatus === "CONFIRMED" || newStatus === "PREPARING" || newStatus === "CANCELLED") {
      orderAlert.stopAlarm();
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("pj_order_confirmed", { detail: { orderId } })
        );
      }
    }

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update status");
      }

      showToast(`Order status updated to ${newStatus}`);
      startTransition(() => {
        setSelectedOrder(data.order);
        setOrders((prev) =>
          prev.map((o) => (o._id === data.order._id ? data.order : o))
        );
      });
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "Status update error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getWhatsAppCustomerUrl = (order: IOrder) => {
    const text = buildAdminStatusMessage(
      order.orderStatus as OrderStatus,
      order,
      settings
    );
    return buildWhatsAppUrl(order.customerSnapshot.phone, text);
  };

  const statuses = [
    "ALL",
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-dhaba font-bold text-2xl md:text-3xl text-[#102a43]">
            Order Management
          </h1>
          <p className="text-xs text-[#6c7b87]">
            Review, confirm, track status progression, and communicate with customers via WhatsApp.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#6c7b87] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order ID, phone, name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#ddd8cf] bg-white outline-none focus:border-[#d99a2b]"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap items-center bg-white p-2 rounded-2xl border border-[#e9e1d4]">
        <Filter className="w-4 h-4 text-[#6c7b87] ml-2 mr-1" />
        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === st
                ? "bg-[#102a43] text-white shadow-sm"
                : "text-[#526575] hover:bg-[#fbf7ef]"
            }`}
          >
            {st.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#e9e1d4] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#6c7b87]">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#6c7b87]">
            No orders found matching the filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fbf7ef] border-b border-[#e9e1d4] text-[#6c7b87] uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Placed At</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e9e1d4]/60">
                {orders.map((ord) => (
                  <tr
                    key={ord._id}
                    onClick={() => setSelectedOrder(ord)}
                    className="hover:bg-[#fbf7ef]/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-black text-[#102a43]">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <b className="text-[#102a43] block">
                        {ord.customerSnapshot.name}
                      </b>
                      <span className="text-[#6c7b87] text-[11px]">
                        {ord.customerSnapshot.phone}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          ord.orderType === "DELIVERY"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-purple-50 text-purple-700"
                        }`}
                      >
                        {ord.orderType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-black text-[#102a43]">
                      {formatCurrency(ord.total)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold block">{ord.paymentMethod}</span>
                      <span
                        className={`text-[10px] ${
                          ord.paymentStatus === "PAID"
                            ? "text-[#2d7a52] font-black"
                            : "text-[#9a6714]"
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                          ord.orderStatus === "PENDING"
                            ? "bg-orange-100 text-orange-700"
                            : ord.orderStatus === "PREPARING"
                            ? "bg-amber-100 text-amber-800"
                            : ord.orderStatus === "READY" ||
                              ord.orderStatus === "READY_FOR_PICKUP"
                            ? "bg-blue-100 text-blue-800"
                            : ord.orderStatus === "OUT_FOR_DELIVERY"
                            ? "bg-indigo-100 text-indigo-800"
                            : ord.orderStatus === "DELIVERED" ||
                              ord.orderStatus === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {ord.orderStatus.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#6c7b87]">
                      {formatDateTime(ord.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(ord);
                        }}
                        className="btn-dhaba bg-[#102a43] hover:bg-[#183b5b] text-white py-1.5 px-3 text-xs"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full Order Management Modal */}
      {selectedOrder && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-details-modal-title"
          className="fixed inset-0 z-50 bg-[#04111b]/65 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-[#e9e1d4] max-h-[90vh] overflow-y-auto space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#e9e1d4]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 id="order-details-modal-title" className="font-serif-dhaba font-bold text-2xl text-[#102a43]">
                    Order #{selectedOrder.orderNumber}
                  </h2>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#f5ead5] text-[#9a6714]">
                    {selectedOrder.orderStatus.replace(/_/g, " ")}
                  </span>
                </div>
                <span className="text-xs text-[#6c7b87]">
                  {formatDateTime(selectedOrder.createdAt)}
                </span>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                aria-label="Close modal"
                className="p-2 text-[#6c7b87] hover:text-[#102a43] rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Progression Buttons */}
            <div>
              <span className="text-xs font-black uppercase text-[#102a43] block mb-2">
                Update Order Status
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus(selectedOrder._id, "CONFIRMED")}
                  className="px-3 py-1.5 rounded-xl border border-blue-400 bg-blue-50 text-blue-800 text-xs font-bold hover:bg-blue-100 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Order</span>
                </button>

                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus(selectedOrder._id, "PREPARING")}
                  className="px-3 py-1.5 rounded-xl border border-amber-400 bg-amber-50 text-amber-800 text-xs font-bold hover:bg-amber-100 flex items-center gap-1.5"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Preparing in Kitchen</span>
                </button>

                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() =>
                    handleUpdateStatus(
                      selectedOrder._id,
                      selectedOrder.orderType === "PICKUP" ? "READY_FOR_PICKUP" : "READY"
                    )
                  }
                  className="px-3 py-1.5 rounded-xl border border-indigo-400 bg-indigo-50 text-indigo-800 text-xs font-bold hover:bg-indigo-100 flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Mark Ready</span>
                </button>

                {selectedOrder.orderType === "DELIVERY" && (
                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={() =>
                      handleUpdateStatus(selectedOrder._id, "OUT_FOR_DELIVERY")
                    }
                    className="px-3 py-1.5 rounded-xl border border-purple-400 bg-purple-50 text-purple-800 text-xs font-bold hover:bg-purple-100 flex items-center gap-1.5"
                  >
                    <Bike className="w-3.5 h-3.5" />
                    <span>Out for Delivery</span>
                  </button>
                )}

                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() =>
                    handleUpdateStatus(
                      selectedOrder._id,
                      selectedOrder.orderType === "PICKUP" ? "COMPLETED" : "DELIVERED"
                    )
                  }
                  className="px-3 py-1.5 rounded-xl border border-green-500 bg-green-50 text-green-800 text-xs font-bold hover:bg-green-100 flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Delivered / Done</span>
                </button>

                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus(selectedOrder._id, "CANCELLED")}
                  className="px-3 py-1.5 rounded-xl border border-red-400 bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel Order</span>
                </button>
              </div>
            </div>

            {/* Payment Collection & Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#fbf7ef] border border-[#e9e1d4]">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-black text-[#102a43]">
                  Payment Status:
                </span>
                <span
                  className={`text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                    selectedOrder.paymentStatus === "PAID"
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}
                >
                  {selectedOrder.paymentStatus === "PAID" ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-green-700" />
                      <span>Complete Payment (PAID)</span>
                    </>
                  ) : (
                    <span>Pending Payment</span>
                  )}
                </span>
                <span className="text-[11px] text-[#6c7b87]">
                  • {selectedOrder.paymentMethod}
                </span>
              </div>

              {selectedOrder.paymentStatus !== "PAID" ? (
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleUpdatePaymentStatus(selectedOrder._id, "PAID")}
                  className="btn-dhaba bg-[#2d7a52] hover:bg-[#236342] text-white py-2 px-3.5 text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  title="Mark payment as received and complete"
                >
                  <Banknote className="w-4 h-4" />
                  <span>Get Payment</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleUpdatePaymentStatus(selectedOrder._id, "PENDING")}
                  className="text-[11px] text-[#9a6714] hover:underline font-semibold"
                >
                  Mark as Pending
                </button>
              )}
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#fbf7ef] border border-[#e9e1d4] text-xs">
              <div>
                <b className="text-sm text-[#102a43] block">Customer Details</b>
                <p className="mt-1">Name: {selectedOrder.customerSnapshot.name}</p>
                <p>Phone: {selectedOrder.customerSnapshot.phone}</p>
                {selectedOrder.customerSnapshot.email && (
                  <p>Email: {selectedOrder.customerSnapshot.email}</p>
                )}
                {selectedOrder.notes && (
                  <p className="mt-2 text-[#9a6714] font-semibold">
                    Note: &quot;{selectedOrder.notes}&quot;
                  </p>
                )}
              </div>

              <div>
                <b className="text-sm text-[#102a43] block">Delivery Location</b>
                {selectedOrder.orderType === "DELIVERY" &&
                selectedOrder.deliveryAddressSnapshot ? (
                  <p className="mt-1 leading-relaxed">
                    {selectedOrder.deliveryAddressSnapshot.houseNumber},{" "}
                    {selectedOrder.deliveryAddressSnapshot.street}
                    {selectedOrder.deliveryAddressSnapshot.landmark
                      ? `, Near ${selectedOrder.deliveryAddressSnapshot.landmark}`
                      : ""}
                    <br />
                    {selectedOrder.deliveryAddressSnapshot.city},{" "}
                    {selectedOrder.deliveryAddressSnapshot.state} -{" "}
                    {selectedOrder.deliveryAddressSnapshot.pincode}
                  </p>
                ) : (
                  <p className="mt-1 text-[#246b9b] font-bold">
                    Self Pickup at Dhaba Counter
                  </p>
                )}
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-2">
              <b className="text-xs uppercase font-black text-[#102a43] block">
                Order Items ({selectedOrder.items.length})
              </b>
              <div className="divide-y divide-[#e9e1d4]/60 border border-[#e9e1d4] rounded-2xl p-4 text-xs">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex justify-between">
                    <div>
                      <b className="text-[#102a43]">{it.name}</b>
                      <span className="text-[#6c7b87] block">
                        {it.quantity} × {formatCurrency(it.unitPrice)}
                        {it.selectedVariant ? ` (${it.selectedVariant.name})` : ""}
                      </span>
                      {it.selectedAddOns && it.selectedAddOns.length > 0 && (
                        <span className="text-[10px] text-[#9a6714] block">
                          + {it.selectedAddOns.map((a) => a.name).join(", ")}
                        </span>
                      )}
                      {it.specialInstructions && (
                        <span className="text-[10px] text-[#6c7b87] italic block">
                          Instruction: {it.specialInstructions}
                        </span>
                      )}
                    </div>
                    <b className="text-[#102a43]">{formatCurrency(it.subtotal)}</b>
                  </div>
                ))}

                <div className="pt-3 flex justify-between text-sm font-black text-[#102a43]">
                  <span>Total Amount</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <a
                href={getWhatsAppCustomerUrl(selectedOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-dhaba bg-[#25D366] hover:bg-[#20bd5a] text-white py-2.5 px-4 text-xs font-bold flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Message Customer on WhatsApp</span>
              </a>

              <div className="flex gap-2">
                <Link
                  href={`/receipt/${selectedOrder.orderNumber}`}
                  target="_blank"
                  className="btn-dhaba bg-[#fbf7ef] hover:bg-[#eee7da] text-[#102a43] border border-[#e9e1d4] py-2.5 px-4 text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
