"use client";

import React, { useState, useEffect, useCallback } from "react";
import { IBooking, BookingStatus } from "@/types";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { buildWhatsAppUrl } from "@/lib/whatsapp/message-builder";
import { Check, X, MessageSquare, Calendar, Users, Phone } from "lucide-react";
import { getCachedData, setCachedData, invalidateCache } from "@/lib/client-cache";
import { orderAlert } from "@/lib/audio";

export default function AdminBookingsPage() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<IBooking[]>(() => {
    return getCachedData<IBooking[]>("admin_bookings") || [];
  });
  const [loading, setLoading] = useState(() => {
    return !getCachedData<IBooking[]>("admin_bookings");
  });

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (data.success && data.bookings) {
        setBookings(data.bookings);
        setCachedData("admin_bookings", data.bookings);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleUpdateStatus = async (id: string, newStatus: BookingStatus) => {
    // If confirming or rejecting, stop alarm immediately
    orderAlert.stopAlarm();
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("pj_booking_confirmed", { detail: { bookingId: id } })
      );
    }

    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        invalidateCache("admin_bookings");
        showToast(`Booking marked as ${newStatus} ✓`);
        fetchBookings();
      }
    } catch {
      showToast("Error updating booking");
    }
  };

  const getWhatsAppBookingUrl = (b: IBooking, status: string) => {
    const text = `Namaste ${b.name}! Your table reservation for ${b.guests} on ${b.date} has been ${status} by Pandit Ji Ka Dhaba. We look forward to serving you! घर का स्वाद ❤️`;
    return buildWhatsAppUrl(b.phone, text);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-dhaba font-bold text-2xl md:text-3xl text-[#102a43]">
          Table Reservations
        </h1>
        <p className="text-xs text-[#6c7b87]">
          Review incoming table requests, confirm or reject, and send instant WhatsApp confirmations.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#e9e1d4] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#6c7b87]">
            Loading table bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#6c7b87]">
            No table booking requests yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fbf7ef] border-b border-[#e9e1d4] text-[#6c7b87] uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Guest Name</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Guests</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e9e1d4]/60">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-[#fbf7ef]/40 transition-colors">
                    <td className="py-3 px-4">
                      <b className="text-sm text-[#102a43] block">{b.name}</b>
                      {b.specialRequest && (
                        <span className="text-[11px] text-[#9a6714] italic block">
                          Request: {b.specialRequest}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#102a43]">
                      {b.phone}
                    </td>
                    <td className="py-3 px-4 text-[#526575]">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-[#d99a2b]" />
                        <span>{b.date}</span>
                      </div>
                      <span className="text-[10px] text-[#6c7b87] block">
                        {b.time || "Lunch / Dinner"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#102a43] bg-[#fbf7ef] px-2.5 py-1 rounded-lg border border-[#e9e1d4]">
                        {b.guests}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                          b.status === "CONFIRMED"
                            ? "bg-green-100 text-green-800"
                            : b.status === "PENDING"
                            ? "bg-amber-100 text-amber-800"
                            : b.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(b._id, "CONFIRMED")}
                              className="btn-dhaba bg-green-600 hover:bg-green-700 text-white py-1 px-2.5 text-xs font-bold"
                              title="Confirm"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Confirm</span>
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(b._id, "REJECTED")}
                              className="btn-dhaba bg-red-600 hover:bg-red-700 text-white py-1 px-2.5 text-xs font-bold"
                              title="Reject"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        <a
                          href={getWhatsAppBookingUrl(b, b.status)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors"
                          title="Message on WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5 fill-current" />
                        </a>
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
