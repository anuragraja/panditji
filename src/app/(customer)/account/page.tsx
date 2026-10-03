"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import { IOrder } from "@/types";
import { Package, MapPin, User, LogOut, ArrowRight, Clock } from "lucide-react";

export default function AccountOverviewPage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [recentOrders, setRecentOrders] = useState<IOrder[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetch("/api/orders")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.orders) {
            setRecentOrders(data.orders.slice(0, 3));
          }
        })
        .catch((err) => console.error("Error fetching orders:", err))
        .finally(() => setFetching(false));
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="bg-[#fbf7ef] min-h-screen py-16 flex items-center justify-center">
        <div className="text-xs font-bold text-[#6c7b87]">Loading your account...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#fbf7ef] min-h-screen py-10">
      <div className="container-dhaba max-w-4xl space-y-6">
        {/* Profile Welcome Header */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e9e1d4] shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#102a43] text-[#f2c35e] font-serif-dhaba font-bold text-2xl flex items-center justify-center shadow-brand">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="text-[11px] font-black tracking-widest text-[#d99a2b] uppercase">
                DHABA CUSTOMER ACCOUNT
              </span>
              <h1 className="font-serif-dhaba font-bold text-2xl text-[#102a43]">
                Namaste, {user.name}!
              </h1>
              <p className="text-xs text-[#6c7b87]">
                {user.phone} {user.email ? `• ${user.email}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="btn-dhaba btn-dhaba-gold py-2.5 px-4 text-xs font-bold"
              >
                Go to Admin Dashboard
              </Link>
            )}
            <button
              onClick={() => logout()}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3.5 py-2.5 rounded-xl border border-red-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/account/orders"
            className="bg-white rounded-2xl p-5 border border-[#e9e1d4] shadow-sm hover:border-[#d99a2b] transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[#f5ead5] flex items-center justify-center text-[#9a6714]">
                <Package className="w-5 h-5" />
              </span>
              <div>
                <b className="block text-sm text-[#102a43]">My Orders</b>
                <span className="text-[11px] text-[#6c7b87]">
                  Track and view order history
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#6c7b87] group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/account/addresses"
            className="bg-white rounded-2xl p-5 border border-[#e9e1d4] shadow-sm hover:border-[#d99a2b] transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[#f5ead5] flex items-center justify-center text-[#9a6714]">
                <MapPin className="w-5 h-5" />
              </span>
              <div>
                <b className="block text-sm text-[#102a43]">Saved Addresses</b>
                <span className="text-[11px] text-[#6c7b87]">
                  {user.addresses?.length || 0} saved locations
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#6c7b87] group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/account/profile"
            className="bg-white rounded-2xl p-5 border border-[#e9e1d4] shadow-sm hover:border-[#d99a2b] transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[#f5ead5] flex items-center justify-center text-[#9a6714]">
                <User className="w-5 h-5" />
              </span>
              <div>
                <b className="block text-sm text-[#102a43]">My Profile</b>
                <span className="text-[11px] text-[#6c7b87]">
                  Edit personal information
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#6c7b87] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Recent Orders Preview */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e9e1d4] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e9e1d4]">
            <h2 className="font-serif-dhaba font-bold text-xl text-[#102a43]">
              Recent Orders
            </h2>
            <Link
              href="/account/orders"
              className="text-xs font-bold text-[#d99a2b] hover:underline"
            >
              View All Orders →
            </Link>
          </div>

          {fetching ? (
            <div className="py-6 text-center text-xs text-[#6c7b87]">
              Loading your recent orders...
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#6c7b87] space-y-2">
              <p>You haven&apos;t placed any orders yet.</p>
              <Link href="/#menu" className="btn-dhaba btn-dhaba-gold py-2 px-4 text-xs inline-block">
                Order Your First Meal
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#e9e1d4]/50">
              {recentOrders.map((ord) => (
                <div
                  key={ord._id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-wrap items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <b className="text-sm text-[#102a43]">{ord.orderNumber}</b>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#f5ead5] text-[#9a6714]">
                        {ord.orderStatus.replace(/_/g, " ")}
                      </span>
                    </div>
                    <span className="text-xs text-[#6c7b87] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDate(ord.createdAt)}</span>
                      <span>•</span>
                      <span>{ord.items.length} dishes</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-black text-sm text-[#102a43]">
                      {formatCurrency(ord.total)}
                    </span>
                    <Link
                      href={`/track-order/${ord.orderNumber}`}
                      className="btn-dhaba bg-[#102a43] hover:bg-[#183b5b] text-white py-2 px-3 text-xs font-bold"
                    >
                      Track Order
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
