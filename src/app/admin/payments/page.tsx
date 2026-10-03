"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { CreditCard, Banknote, QrCode } from "lucide-react";
import { IOrder } from "@/types";

export default function AdminPaymentsPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.orders) {
          setOrders(d.orders);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

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
                  <th className="py-3.5 px-4">Status</th>
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
                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                          o.paymentStatus === "PAID"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {o.paymentStatus}
                      </span>
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
