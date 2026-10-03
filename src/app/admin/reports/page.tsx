"use client";

import React, { useState, useEffect, useCallback } from "react";
import { formatCurrency } from "@/lib/utils";
import { Download, BarChart2, TrendingUp, DollarSign } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ReportData {
  totalRevenue: number;
  totalOrders: number;
  chartData: Array<{ date: string; revenue: number; orders: number }>;
  topDishes: Array<{ name: string; count: number; revenue: number }>;
  paymentMethods: Array<{ name: string; count: number }>;
}

export default function AdminReportsPage() {
  const [range, setRange] = useState("7");
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?range=${range}`);
      const data = await res.json();
      if (data.success && data.report) {
        setReport(data.report);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExportCSV = () => {
    if (!report || !report.chartData) return;

    let csvContent = "data:text/csv;charset=utf-8,Date,Revenue,Orders\n";
    report.chartData.forEach((row) => {
      csvContent += `${row.date},${row.revenue},${row.orders}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `panditji_sales_report_${range}days.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const COLORS = ["#102a43", "#d99a2b", "#246b9b", "#2d7a52"];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-dhaba font-bold text-2xl md:text-3xl text-[#102a43]">
            Analytics & Sales Reports
          </h1>
          <p className="text-xs text-[#6c7b87]">
            Revenue breakdown, popular dishes, and payment mode analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Filter Buttons */}
          <div className="bg-white p-1 rounded-2xl border border-[#e9e1d4] flex gap-1">
            {[
              { label: "7 Days", val: "7" },
              { label: "30 Days", val: "30" },
              { label: "All Time", val: "90" },
            ].map((t) => (
              <button
                key={t.val}
                onClick={() => setRange(t.val)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  range === t.val
                    ? "bg-[#102a43] text-white shadow-sm"
                    : "text-[#526575] hover:bg-gray-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="btn-dhaba btn-dhaba-gold py-2 px-3 text-xs font-bold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-[#6c7b87]">
          Generating analytics report...
        </div>
      ) : (
        <>
          {/* Overview Metric Banners */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-[#e9e1d4] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#f5ead5] text-[#d99a2b] flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#6c7b87] block">
                  Total Sales ({range} days)
                </span>
                <b className="font-serif-dhaba font-bold text-2xl text-[#102a43]">
                  {formatCurrency(report?.totalRevenue || 0)}
                </b>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#e9e1d4] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#246b9b] flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#6c7b87] block">
                  Total Orders
                </span>
                <b className="font-serif-dhaba font-bold text-2xl text-[#102a43]">
                  {report?.totalOrders || 0} orders
                </b>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#e9e1d4] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <BarChart2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#6c7b87] block">
                  Average Order Value
                </span>
                <b className="font-serif-dhaba font-bold text-2xl text-[#102a43]">
                  {report && report.totalOrders > 0
                    ? formatCurrency(report.totalRevenue / report.totalOrders)
                    : "₹0"}
                </b>
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-3xl p-6 border border-[#e9e1d4] shadow-sm">
            <h2 className="font-serif-dhaba font-bold text-lg text-[#102a43] mb-4">
              Daily Revenue Bar Chart
            </h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report?.chartData || []}>
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
                  <Bar dataKey="revenue" fill="#d99a2b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Popular Dishes & Payment Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Selling Dishes */}
            <div className="bg-white rounded-3xl p-6 border border-[#e9e1d4] shadow-sm space-y-4">
              <h2 className="font-serif-dhaba font-bold text-lg text-[#102a43] pb-2 border-b border-[#e9e1d4]">
                Top 5 Best-Selling Dishes
              </h2>
              {!report?.topDishes || report.topDishes.length === 0 ? (
                <p className="text-xs text-[#6c7b87]">No dish sales data yet.</p>
              ) : (
                <div className="space-y-3">
                  {report.topDishes.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#fbf7ef] border border-[#e9e1d4] text-xs"
                    >
                      <div>
                        <b className="text-sm text-[#102a43] block">{d.name}</b>
                        <span className="text-[#6c7b87]">{d.count} portions sold</span>
                      </div>
                      <b className="text-[#d99a2b] font-black text-sm">
                        {formatCurrency(d.revenue)}
                      </b>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-3xl p-6 border border-[#e9e1d4] shadow-sm space-y-4">
              <h2 className="font-serif-dhaba font-bold text-lg text-[#102a43] pb-2 border-b border-[#e9e1d4]">
                Payment Methods Distribution
              </h2>
              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={report?.paymentMethods || []}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      label={(entry) => `${entry.name}: ${entry.count}`}
                      fontSize={11}
                    >
                      {(report?.paymentMethods || []).map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
