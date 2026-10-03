"use client";

import React, { useState, useEffect, useCallback } from "react";
import { IReview } from "@/types";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { Check, X, Trash2, Star } from "lucide-react";

export default function AdminReviewsPage() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch("/api/reviews?all=true");
      const data = await res.json();
      if (data.success && data.reviews) {
        setReviews(data.reviews);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleToggleApprove = async (review: IReview) => {
    try {
      const res = await fetch(`/api/reviews/${review._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: !review.approved }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Review ${!review.approved ? "Approved" : "Unapproved"}`);
        fetchReviews();
      }
    } catch {
      showToast("Error updating review");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;

    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("Review deleted ✓");
        fetchReviews();
      }
    } catch {
      showToast("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-dhaba font-bold text-2xl md:text-3xl text-[#102a43]">
          Customer Reviews Moderation
        </h1>
        <p className="text-xs text-[#6c7b87]">
          Approve or reject customer feedback before it is published on the restaurant website.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#e9e1d4] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#6c7b87]">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#6c7b87]">
            No customer reviews submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fbf7ef] border-b border-[#e9e1d4] text-[#6c7b87] uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Guest</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Comment</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e9e1d4]/60">
                {reviews.map((r) => (
                  <tr key={r._id} className="hover:bg-[#fbf7ef]/40 transition-colors">
                    <td className="py-3 px-4">
                      <b className="text-sm text-[#102a43] block">{r.name}</b>
                      <span className="text-[10px] text-[#6c7b87]">
                        {r.roleTitle || "Guest"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center text-[#d99a2b] font-bold">
                        <span>{r.rating}</span>
                        <Star className="w-3.5 h-3.5 fill-current ml-1" />
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <p className="text-xs text-[#526575] line-clamp-2">
                        “{r.comment}”
                      </p>
                    </td>
                    <td className="py-3 px-4 text-[#6c7b87]">
                      {formatDate(r.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                          r.approved
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {r.approved ? "APPROVED" : "PENDING"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleApprove(r)}
                          className={`btn-dhaba py-1.5 px-3 text-xs font-bold ${
                            r.approved
                              ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                        >
                          {r.approved ? "Hide" : "Approve"}
                        </button>
                        <button
                          onClick={() => handleDelete(r._id)}
                          className="p-1.5 text-[#6c7b87] hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
