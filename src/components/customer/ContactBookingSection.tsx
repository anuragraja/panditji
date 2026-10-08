"use client";

import React, { useState } from "react";
import { IRestaurantSettings } from "@/types";
import { buildWhatsAppUrl } from "@/lib/whatsapp/message-builder";
import { CheckCircle2, MessageSquare } from "lucide-react";
import { orderAlert } from "@/lib/audio";

interface ContactBookingSectionProps {
  settings?: IRestaurantSettings | null;
}

export function ContactBookingSection({ settings }: ContactBookingSectionProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    time: "Lunch / Dinner",
    guests: "1–2 Guests",
    specialRequest: "",
  });

  const [loading, setLoading] = useState(false);
  const [successBooking, setSuccessBooking] = useState<{
    id: string;
    whatsappUrl?: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const restaurantAddress =
    settings?.address || "Main Road, Bhopal, Madhya Pradesh";
  const restaurantPhone = settings?.phone || "+91 90000 00000";
  const restaurantHours =
    settings?.openingHours || "11:00 AM – 11:00 PM • Every Day";
  const whatsappNumber = settings?.whatsappNumber || "919000000000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit booking request");
      }

      // Generate WhatsApp booking URL
      const bookingText = [
        "🍛 *PANDIT JI KA DHABA*",
        "_Table Reservation Request_",
        "",
        `*Name:* ${formData.name}`,
        `*Phone:* ${formData.phone}`,
        `*Date:* ${formData.date}`,
        `*Guests:* ${formData.guests}`,
        formData.specialRequest ? `*Request:* ${formData.specialRequest}` : null,
        "",
        "Please confirm my table reservation. Dhanyawad!",
      ]
        .filter(Boolean)
        .join("\n");

      const waUrl = buildWhatsAppUrl(whatsappNumber, bookingText);

      // Play audible confirmation alarm/chime for table booking
      orderAlert.playOrderChime();

      setSuccessBooking({
        id: data.booking?._id || "booked",
        whatsappUrl: waUrl,
      });

      setFormData({
        name: "",
        phone: "",
        date: "",
        time: "Lunch / Dinner",
        guests: "1–2 Guests",
        specialRequest: "",
      });
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Something went wrong. Please call us.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#102a43] text-white py-[82px]" id="contact">
      <div className="container-dhaba grid grid-cols-[1.2fr_0.8fr] max-md:grid-cols-1 gap-[65px] max-md:gap-[35px] items-start">
        {/* Contact details */}
        <div>
          <div className="eyebrow text-[#f5d28d]">COME & VISIT</div>
          <h2 className="font-serif-dhaba font-extrabold text-[43px] max-sm:text-[35px] leading-[1.12] text-white mt-[9px]">
            Let&apos;s Share A Meal.
          </h2>
          <p className="text-[#c4d1d9] max-w-[540px] text-[14px] my-[16px] mb-[28px] leading-relaxed">
            Drop in for a hearty meal, a refreshing drink and the kind of hospitality that makes you want to come back.
          </p>

          <div className="grid gap-[17px]">
            <div className="flex gap-[13px] items-start">
              <span className="text-[20px] select-none">📍</span>
              <div>
                <b className="block text-[13px] font-bold text-white">Address</b>
                <span className="block text-[#b8c7d0] text-[12px] mt-[3px]">
                  {restaurantAddress}
                </span>
              </div>
            </div>

            <div className="flex gap-[13px] items-start">
              <span className="text-[20px] select-none">📞</span>
              <div>
                <b className="block text-[13px] font-bold text-white">Call Us</b>
                <span className="block text-[#b8c7d0] text-[12px] mt-[3px]">
                  {restaurantPhone}
                </span>
              </div>
            </div>

            <div className="flex gap-[13px] items-start">
              <span className="text-[20px] select-none">🕐</span>
              <div>
                <b className="block text-[13px] font-bold text-white">Opening Hours</b>
                <span className="block text-[#b8c7d0] text-[12px] mt-[3px]">
                  {restaurantHours}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking form */}
        <div className="bg-white text-[#172b3a] rounded-[19px] p-[27px] shadow-2xl border border-white/20">
          <h3 className="font-serif-dhaba font-bold text-[25px] text-[#102a43] mb-[15px]">
            Book a Table
          </h3>

          {successBooking ? (
            <div className="bg-[#fbf7ef] p-5 rounded-xl border border-[#d99a2b]/30 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-[#2d7a52] mx-auto" />
              <h4 className="font-serif-dhaba font-bold text-lg text-[#102a43]">
                Reservation Request Received!
              </h4>
              <p className="text-xs text-[#6c7b87]">
                We have received your table booking details. Our team will call or message to confirm your table.
              </p>
              {successBooking.whatsappUrl && (
                <a
                  href={successBooking.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold px-4 py-2.5 rounded-lg w-full shadow-sm transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Booking Request on WhatsApp</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => setSuccessBooking(null)}
                className="text-xs font-bold text-[#102a43] underline block mx-auto pt-2"
              >
                Book Another Table
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  required
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-[12px_13px] border border-[#ddd8cf] rounded-[9px] outline-none text-xs bg-white text-[#172b3a] focus:border-[#d99a2b]"
                />
              </div>

              <div>
                <input
                  required
                  type="tel"
                  placeholder="Phone Number (e.g. 9876543210)"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full p-[12px_13px] border border-[#ddd8cf] rounded-[9px] outline-none text-xs bg-white text-[#172b3a] focus:border-[#d99a2b]"
                />
              </div>

              <div>
                <input
                  required
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full p-[12px_13px] border border-[#ddd8cf] rounded-[9px] outline-none text-xs bg-white text-[#172b3a] focus:border-[#d99a2b]"
                />
              </div>

              <div>
                <select
                  required
                  value={formData.guests}
                  onChange={(e) =>
                    setFormData({ ...formData, guests: e.target.value })
                  }
                  className="w-full p-[12px_13px] border border-[#ddd8cf] rounded-[9px] outline-none text-xs bg-white text-[#172b3a] focus:border-[#d99a2b]"
                >
                  <option value="">Number of Guests</option>
                  <option value="1–2 Guests">1–2 Guests</option>
                  <option value="3–4 Guests">3–4 Guests</option>
                  <option value="5–8 Guests">5–8 Guests</option>
                  <option value="9+ Guests">9+ Guests</option>
                </select>
              </div>

              {errorMsg && (
                <p className="text-xs text-red-500 font-semibold">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-dhaba btn-dhaba-gold py-[12px] text-xs font-bold disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Request Booking"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
