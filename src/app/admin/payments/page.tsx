"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { CreditCard, Banknote, QrCode, CheckCircle } from "lucide-react";
import { IOrder } from "@/types";
import { getCachedData, setCachedData, invalidateCache } from "@/lib/client-cache";
import { useToast } from "@/context/ToastContext";

export default function AdminPaymentsPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<IOrder[]>(() => {
    return getCachedData<IOrder[]>("admin_payments") || [];
  });
  const [loading, setLoading] = useState(() => {
    return !getCachedData<IOrder[]>("admin_payments");
  });

  const fetchPayments = async () => {
    try {
      const res = await fetch("/api/orders");
      const d = await res.json();
      if (d.success && d.orders) {
        setOrders(d.orders);
        setCachedData("admin_payments", d.orders);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleMarkPaymentComplete = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: "PAID" }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Payment marked as Complete (PAID) ✓");
        invalidateCache("admin_payments");
        invalidateCache("admin_orders");
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, paymentStatus: "PAID" } : o))
        );
      }
    } catch {
      showToast("Error updating payment");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-dhaba font-bold text-2xl md:text-3xl text-[#102a43]">
          Payments & Transactions
        </h1>
        <p className="text-xs text-[#6c7b87]">
          Monitor online gateway settlements, UPI payments, and cash on delivery collections.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#e9e1d4] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#6c7b87]">
            Loading payment records...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#6c7b87]">
            No payment records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fbf7ef] border-b border-[#e9e1d4] text-[#6c7b87] uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Payment Status</th>
                  <th className="py-3.5 px-4">Transaction Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e9e1d4]/60">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-[#fbf7ef]/40 transition-colors">
                    <td className="py-3 px-4 font-black text-[#102a43]">
                      {o.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <b className="text-sm text-[#102a43] block">
                        {o.customerSnapshot.name}
                      </b>
                      <span className="text-[11px] text-[#6c7b87]">
                        {o.customerSnapshot.phone}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-[#102a43]">
                        {o.paymentMethod === "COD" ? (
                          <Banknote className="w-4 h-4 text-[#2d7a52]" />
                        ) : o.paymentMethod === "UPI" ? (
                          <QrCode className="w-4 h-4 text-[#246b9b]" />
                        ) : (
                          <CreditCard className="w-4 h-4 text-[#9a6714]" />
                        )}
                        <span>{o.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-black text-sm text-[#102a43]">
                      {formatCurrency(o.total)}
                    </td>
                    <td className="py-3 px-4">
                      {o.paymentStatus === "PAID" ? (
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-green-100 text-green-800 border border-green-300 inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-700" />
                          <span>Complete Payment (PAID)</span>
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            Pending
                          </span>
                          <button
                            type="button"
                            onClick={() => handleMarkPaymentComplete(o._id)}
                            className="btn-dhaba bg-[#2d7a52] hover:bg-[#236342] text-white py-1 px-2.5 text-[10px] font-bold flex items-center gap-1 shadow-sm active:scale-95"
                            title="Get Payment and mark complete"
                          >
                            <Banknote className="w-3 h-3" />
                            <span>Get Payment</span>
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#6c7b87]">
                      {formatDateTime(o.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
