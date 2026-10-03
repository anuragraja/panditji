"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ICoupon, DiscountType } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { Plus, Tag, Check, X, Percent, IndianRupee } from "lucide-react";

export default function AdminOffersPage() {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrder, setMinOrder] = useState<number>(399);
  const [maxDiscount, setMaxDiscount] = useState<number | undefined>(100);
  const [expiryDate, setExpiryDate] = useState("2027-12-31");
  const [usageLimit, setUsageLimit] = useState<number | undefined>(500);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await fetch("/api/coupons");
      const data = await res.json();
      if (data.success && data.coupons) {
        setCoupons(data.coupons);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          description: description.trim(),
          discountType,
          discountValue: Number(discountValue),
          minOrder: Number(minOrder),
          maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
          startDate: new Date(),
          expiryDate: new Date(expiryDate),
          usageLimit: usageLimit ? Number(usageLimit) : undefined,
          active,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create coupon");
      }

      showToast(`Coupon ${code} created successfully! ✓`);
      setModalOpen(false);
      fetchCoupons();
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "Error creating coupon");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-dhaba font-bold text-2xl md:text-3xl text-[#102a43]">
            Offers & Coupons
          </h1>
          <p className="text-xs text-[#6c7b87]">
            Create and manage promo discount codes with minimum order thresholds and limits.
          </p>
        </div>

        <button
          onClick={() => {
            setCode("");
            setDescription("");
            setDiscountType("PERCENTAGE");
            setDiscountValue(10);
            setMinOrder(399);
            setMaxDiscount(100);
            setModalOpen(true);
          }}
          className="btn-dhaba btn-dhaba-gold py-2.5 px-4 text-xs font-bold flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-3xl border border-[#e9e1d4] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#6c7b87]">
            Loading coupons...
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#6c7b87]">
            No coupons found. Click Create New Coupon to add one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fbf7ef] border-b border-[#e9e1d4] text-[#6c7b87] uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Coupon Code</th>
                  <th className="py-3.5 px-4">Discount</th>
                  <th className="py-3.5 px-4">Conditions</th>
                  <th className="py-3.5 px-4">Validity</th>
                  <th className="py-3.5 px-4">Usage</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e9e1d4]/60">
                {coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-[#fbf7ef]/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#d99a2b]" />
                        <span className="font-mono font-black text-sm text-[#102a43] bg-[#fbf7ef] px-2 py-0.5 rounded border border-[#d99a2b]/30">
                          {c.code}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#6c7b87] block mt-1">
                        {c.description}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <b className="text-sm font-black text-[#2d7a52]">
                        {c.discountType === "PERCENTAGE"
                          ? `${c.discountValue}% OFF`
                          : formatCurrency(c.discountValue)}
                      </b>
                      {c.maxDiscount && (
                        <span className="text-[10px] text-[#6c7b87] block">
                          Up to {formatCurrency(c.maxDiscount)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#526575]">
                      <span>Min Order: {formatCurrency(c.minOrder)}</span>
                    </td>
                    <td className="py-3 px-4 text-[#6c7b87]">
                      <span>Expires {formatDate(c.expiryDate)}</span>
                    </td>
                    <td className="py-3 px-4 text-[#526575]">
                      <b className="text-[#102a43]">{c.usedCount || 0}</b>
                      {c.usageLimit ? ` / ${c.usageLimit}` : " uses"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                          c.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {c.active ? "ACTIVE" : "DISABLED"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="coupon-modal-title"
          className="fixed inset-0 z-50 bg-[#04111b]/65 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e9e1d4] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#e9e1d4]">
              <h2 id="coupon-modal-title" className="font-serif-dhaba font-bold text-xl text-[#102a43]">
                Create Promotional Offer
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
                className="p-1 text-[#6c7b87] hover:text-[#102a43]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#102a43] mb-1">
                  Coupon Code *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. PANDIT10"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 border border-[#ddd8cf] rounded-xl outline-none font-mono uppercase font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-[#102a43] mb-1">
                  Description *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. 10% OFF on family feast orders above ₹399"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 border border-[#ddd8cf] rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#102a43] mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                    className="w-full p-2.5 border border-[#ddd8cf] rounded-xl outline-none bg-white"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Flat (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#102a43] mb-1">
                    Value *
                  </label>
                  <input
                    required
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full p-2.5 border border-[#ddd8cf] rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#102a43] mb-1">
                    Minimum Order (₹)
                  </label>
                  <input
                    type="number"
                    value={minOrder}
                    onChange={(e) => setMinOrder(Number(e.target.value))}
                    className="w-full p-2.5 border border-[#ddd8cf] rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#102a43] mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="Optional"
                    value={maxDiscount || ""}
                    onChange={(e) =>
                      setMaxDiscount(e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="w-full p-2.5 border border-[#ddd8cf] rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#102a43] mb-1">
                    Expiry Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full p-2.5 border border-[#ddd8cf] rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#102a43] mb-1">
                    Total Uses Limit
                  </label>
                  <input
                    type="number"
                    value={usageLimit || ""}
                    onChange={(e) =>
                      setUsageLimit(e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="w-full p-2.5 border border-[#ddd8cf] rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="couponActive"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="couponActive" className="font-bold text-[#102a43]">
                  Active and redeemable
                </label>
              </div>

              <div className="pt-3 border-t border-[#e9e1d4] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-dhaba bg-gray-100 text-gray-700 py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-dhaba btn-dhaba-gold py-2 px-5 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
