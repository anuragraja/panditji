"use client";

import React, { useState, useEffect, useCallback } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Search, Users, MapPin, ShoppingBag } from "lucide-react";

interface CustomerRecord {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder?: string | Date;
  createdAt: string | Date;
  addresses?: Array<{
    houseNumber: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  }>;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      const url = new URL("/api/admin/customers", window.location.origin);
      if (search) url.searchParams.set("search", search);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success && data.customers) {
        setCustomers(data.customers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-dhaba font-bold text-2xl md:text-3xl text-[#102a43]">
            Customer Directory
          </h1>
          <p className="text-xs text-[#6c7b87]">
            View registered guests, lifetime orders, spending totals, and delivery addresses.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#6c7b87] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#ddd8cf] bg-white outline-none focus:border-[#d99a2b]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#e9e1d4] shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-xs text-[#6c7b87]">
              Loading customer profiles...
            </div>
          ) : customers.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#6c7b87]">
              No customers found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fbf7ef] border-b border-[#e9e1d4] text-[#6c7b87] uppercase text-[10px] font-black tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4 text-center">Orders</th>
                    <th className="py-3.5 px-4 text-right">Spent</th>
                    <th className="py-3.5 px-4">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e9e1d4]/60">
                  {customers.map((c) => (
                    <tr
                      key={c._id}
                      onClick={() => setSelectedCustomer(c)}
                      className={`hover:bg-[#fbf7ef]/60 cursor-pointer transition-colors ${
                        selectedCustomer?._id === c._id ? "bg-[#f5ead5]/40" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#102a43] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <b className="text-sm text-[#102a43] block">{c.name}</b>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold block">{c.phone}</span>
                        <span className="text-[10px] text-[#6c7b87]">
                          {c.email || "No email"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-[#102a43]">
                        {c.totalOrders}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-[#102a43]">
                        {formatCurrency(c.totalSpent)}
                      </td>
                      <td className="py-3 px-4 text-[#6c7b87]">
                        {formatDate(c.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Customer Details Card */}
        <div className="bg-white rounded-3xl p-6 border border-[#e9e1d4] shadow-sm space-y-4">
          <h2 className="font-serif-dhaba font-bold text-lg text-[#102a43] pb-2 border-b border-[#e9e1d4] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#d99a2b]" />
            <span>Customer Profile</span>
          </h2>

          {selectedCustomer ? (
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#102a43] text-[#f2c35e] font-serif-dhaba font-bold text-xl flex items-center justify-center">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <b className="text-base text-[#102a43] block">
                    {selectedCustomer.name}
                  </b>
                  <span className="text-[#6c7b87]">
                    Joined on {formatDate(selectedCustomer.createdAt)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-[#fbf7ef] rounded-2xl border border-[#e9e1d4]">
                <div>
                  <span className="text-[10px] text-[#6c7b87] uppercase font-bold block">
                    Total Orders
                  </span>
                  <b className="text-lg text-[#102a43]">
                    {selectedCustomer.totalOrders}
                  </b>
                </div>
                <div>
                  <span className="text-[10px] text-[#6c7b87] uppercase font-bold block">
                    Lifetime Spend
                  </span>
                  <b className="text-lg text-[#d99a2b]">
                    {formatCurrency(selectedCustomer.totalSpent)}
                  </b>
                </div>
              </div>

              <div>
                <b className="text-xs text-[#102a43] block mb-1">Contact Information:</b>
                <p className="text-[#526575]">Phone: {selectedCustomer.phone}</p>
                <p className="text-[#526575]">
                  Email: {selectedCustomer.email || "Not provided"}
                </p>
              </div>

              <div>
                <b className="text-xs text-[#102a43] block mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#d99a2b]" />
                  <span>Saved Addresses ({selectedCustomer.addresses?.length || 0}):</span>
                </b>
                {!selectedCustomer.addresses || selectedCustomer.addresses.length === 0 ? (
                  <p className="text-xs text-[#89959e] italic">No saved addresses</p>
                ) : (
                  <div className="space-y-2 mt-2">
                    {selectedCustomer.addresses.map((a, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl border border-[#e9e1d4] bg-[#fffdf9] text-[11px]"
                      >
                        <p className="font-semibold text-[#102a43]">
                          {a.houseNumber}, {a.street}
                        </p>
                        <p className="text-[#6c7b87]">
                          {a.city}, {a.state} - {a.pincode}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[#6c7b87] space-y-1">
              <ShoppingBag className="w-8 h-8 text-[#89959e] mx-auto mb-2" />
              <p>Click on any customer in the table to view their full profile.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
