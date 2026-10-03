"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { IOrder, IMenuItem } from "@/types";
import {
  ShoppingBag,
  IndianRupee,
  Clock,
  Flame,
  CheckCircle2,
  Users,
  Plus,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface StatsData {
  todaysOrdersCount: number;
  todaysRevenue: number;
  pendingOrdersCount: number;
  preparingOrdersCount: number;
  completedOrdersCount: number;
  totalCustomersCount: number;
  recentOrders: IOrder[];
  lowStockItems: IMenuItem[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [chartData, setChartData] = useState<Array<{ date: string; revenue: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/reports?range=7").then((r) => r.json()),
    ])
      .then(([statsRes, reportsRes]) => {
        if (statsRes.success) {
          setStats(statsRes.stats);
        }
        if (reportsRes.success && reportsRes.report) {
          setChartData(reportsRes.report.chartData);
        }
      })
      .catch((err) => console.error("Error loading dashboard data:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs font-bold text-[#6c7b87]">
        Loading dhaba metrics and live kitchen stats...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-dhaba font-bold text-2xl md:text-3xl text-[#102a43]">
            Restaurant Dashboard
          </h1>
          <p className="text-xs text-[#6c7b87]">
            Real-time overview of kitchen orders, customer sales, and inventory status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/menu?action=new"
            className="btn-dhaba btn-dhaba-gold py-2.5 px-3.5 text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </Link>
          <Link
            href="/admin/orders?status=PENDING"
            className="btn-dhaba bg-[#102a43] hover:bg-[#183b5b] text-white py-2.5 px-3.5 text-xs font-bold flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4 text-[#f2c35e]" />
            <span>View New Orders</span>
          </Link>
        </div>
      </div>

      {/* 6 Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {/* Today's Orders */}
        <div className="bg-white rounded-2xl p-4 border border-[#e9e1d4] shadow-sm">
          <div className="flex items-center justify-between text-[#6c7b87] mb-2">
            <span className="text-[11px] font-bold">Today&apos;s Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#102a43]" />
          </div>
          <b className="font-serif-dhaba font-bold text-2xl text-[#102a43] block">
            {stats?.todaysOrdersCount || 0}
          </b>
          <span className="text-[10px] text-[#2d7a52] font-semibold">Active today</span>
        </div>

        {/* Today's Revenue */}
        <div className="bg-white rounded-2xl p-4 border border-[#e9e1d4] shadow-sm">
          <div className="flex items-center justify-between text-[#6c7b87] mb-2">
            <span className="text-[11px] font-bold">Today&apos;s Revenue</span>
            <IndianRupee className="w-4 h-4 text-[#d99a2b]" />
          </div>
          <b className="font-serif-dhaba font-bold text-2xl text-[#102a43] block">
            {formatCurrency(stats?.todaysRevenue || 0)}
          </b>
          <span className="text-[10px] text-[#d99a2b] font-semibold">Gross sales</span>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-2xl p-4 border border-[#e9e1d4] shadow-sm">
          <div className="flex items-center justify-between text-[#6c7b87] mb-2">
            <span className="text-[11px] font-bold">Pending</span>
            <Clock className="w-4 h-4 text-orange-500" />
          </div>
          <b className="font-serif-dhaba font-bold text-2xl text-orange-600 block">
            {stats?.pendingOrdersCount || 0}
          </b>
          <span className="text-[10px] text-orange-600 font-semibold">Needs confirmation</span>
        </div>

        {/* Preparing */}
        <div className="bg-white rounded-2xl p-4 border border-[#e9e1d4] shadow-sm">
          <div className="flex items-center justify-between text-[#6c7b87] mb-2">
            <span className="text-[11px] font-bold">In Kitchen</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <b className="font-serif-dhaba font-bold text-2xl text-amber-600 block">
            {stats?.preparingOrdersCount || 0}
          </b>
          <span className="text-[10px] text-amber-600 font-semibold">Being cooked</span>
        </div>

        {/* Completed Orders */}
        <div className="bg-white rounded-2xl p-4 border border-[#e9e1d4] shadow-sm">
          <div className="flex items-center justify-between text-[#6c7b87] mb-2">
            <span className="text-[11px] font-bold">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <b className="font-serif-dhaba font-bold text-2xl text-green-700 block">
            {stats?.completedOrdersCount || 0}
          </b>
          <span className="text-[10px] text-green-600 font-semibold">Delivered/Pickup</span>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-2xl p-4 border border-[#e9e1d4] shadow-sm">
          <div className="flex items-center justify-between text-[#6c7b87] mb-2">
            <span className="text-[11px] font-bold">Registered Guests</span>
            <Users className="w-4 h-4 text-[#246b9b]" />
          </div>
          <b className="font-serif-dhaba font-bold text-2xl text-[#102a43] block">
            {stats?.totalCustomersCount || 0}
          </b>
          <span className="text-[10px] text-[#246b9b] font-semibold">Total accounts</span>
        </div>
      </div>

      {/* Sales Chart Section */}
      <div className="bg-white rounded-3xl p-6 border border-[#e9e1d4] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-serif-dhaba font-bold text-lg text-[#102a43]">
              Weekly Revenue Trend
            </h2>
            <span className="text-xs text-[#6c7b87]">Last 7 days kitchen revenue</span>
          </div>
          <Link
            href="/admin/reports"
            className="text-xs font-bold text-[#d99a2b] hover:underline"
          >
            Full Reports →
          </Link>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d99a2b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#d99a2b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#6c7b87" fontSize={11} />
              <YAxis stroke="#6c7b87" fontSize={11} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                formatter={(val: number) => [`₹${val}`, "Revenue"]}
                contentStyle={{
                  backgroundColor: "#102a43",
                  color: "#fff",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#d99a2b"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Grid: Recent Orders & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders List */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#e9e1d4] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#e9e1d4]">
            <h2 className="font-serif-dhaba font-bold text-lg text-[#102a43]">
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-[#d99a2b] hover:underline"
            >
              All Orders →
            </Link>
          </div>

          {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#6c7b87]">
              No recent orders found.
            </div>
          ) : (
            <div className="divide-y divide-[#e9e1d4]/50">
              {stats.recentOrders.map((ord) => (
                <div
                  key={ord._id}
                  className="py-3 first:pt-0 last:pb-0 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <b className="text-sm text-[#102a43]">{ord.orderNumber}</b>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#f5ead5] text-[#9a6714]">
                        {ord.orderStatus.replace(/_/g, " ")}
                      </span>
                    </div>
                    <span className="text-[#6c7b87] block mt-0.5">
                      {ord.customerSnapshot.name} • {ord.customerSnapshot.phone}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <b className="text-sm font-black text-[#102a43] block">
                        {formatCurrency(ord.total)}
                      </b>
                      <span className="text-[10px] text-[#6c7b87]">
                        {ord.paymentMethod}
                      </span>
                    </div>

                    <Link
                      href={`/admin/orders?search=${ord.orderNumber}`}
                      className="p-1.5 rounded-lg bg-[#fbf7ef] text-[#102a43] hover:bg-[#d99a2b] hover:text-white transition-colors"
                      title="Manage order"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock / Unavailable Items */}
        <div className="bg-white rounded-3xl p-6 border border-[#e9e1d4] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#e9e1d4]">
            <h2 className="font-serif-dhaba font-bold text-lg text-[#102a43] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Unavailable Items</span>
            </h2>
            <Link
              href="/admin/menu"
              className="text-xs font-bold text-[#d99a2b] hover:underline"
            >
              Menu →
            </Link>
          </div>

          {!stats?.lowStockItems || stats.lowStockItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#2d7a52] font-semibold space-y-1">
              <CheckCircle2 className="w-8 h-8 mx-auto text-[#2d7a52]" />
              <p>All menu items are currently marked available!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.lowStockItems.map((item) => (
                <div
                  key={item._id}
                  className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <b className="text-[#102a43] block">{item.name}</b>
                    <span className="text-[10px] text-amber-700">
                      Category: {item.category}
                    </span>
                  </div>
                  <Link
                    href={`/admin/menu`}
                    className="text-[11px] font-bold text-[#d99a2b] underline"
                  >
                    Enable
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Quick Help Card */}
          <div className="p-4 rounded-2xl bg-[#102a43] text-white text-xs space-y-1 mt-4">
            <b className="block text-sm font-bold text-[#f5d28d]">
              WhatsApp Integration
            </b>
            <p className="text-[#cbd8e0] text-[11px]">
              Orders are permanently recorded in database. Customer click opens WhatsApp to chat directly with kitchen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
