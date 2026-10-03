"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import { Save, Phone, MessageSquare, Bike, IndianRupee, Clock, ShieldCheck } from "lucide-react";
import { IRestaurantSettings } from "@/types";

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Restaurant details
  const [restaurantName, setRestaurantName] = useState("");
  const [tagline, setTagline] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [openingHours, setOpeningHours] = useState("");

  // WhatsApp
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappOrdersEnabled, setWhatsappOrdersEnabled] = useState(true);

  // Ordering & Delivery settings
  const [acceptOrders, setAcceptOrders] = useState(true);
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [pickupEnabled, setPickupEnabled] = useState(true);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(150);
  const [deliveryFee, setDeliveryFee] = useState<number>(30);
  const [freeDeliveryAbove, setFreeDeliveryAbove] = useState<number>(499);
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState("30-45 mins");

  // Taxes
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxPercentage, setTaxPercentage] = useState<number>(5);

  // Payment gateways
  const [codEnabled, setCodEnabled] = useState(true);
  const [upiEnabled, setUpiEnabled] = useState(true);
  const [upiId, setUpiId] = useState("panditji@upi");
  const [onlinePaymentEnabled, setOnlinePaymentEnabled] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.settings) {
          const s = d.settings as IRestaurantSettings;
          setRestaurantName(s.restaurantName || "Pandit Ji Ka Dhaba");
          setTagline(s.tagline || "घर का स्वाद");
          setPhone(s.phone || "+91 90000 00000");
          setEmail(s.email || "contact@panditjikadhaba.com");
          setAddress(s.address || "Main Road, Bhopal, Madhya Pradesh");
          setOpeningHours(s.openingHours || "11:00 AM – 11:00 PM • Every Day");
          setWhatsappNumber(s.whatsappNumber || "919000000000");
          setWhatsappOrdersEnabled(s.whatsappOrdersEnabled !== false);
          setAcceptOrders(s.acceptOrders !== false);
          setDeliveryEnabled(s.deliveryEnabled !== false);
          setPickupEnabled(s.pickupEnabled !== false);
          setMinOrderAmount(s.minOrderAmount || 150);
          setDeliveryFee(s.deliveryFee || 30);
          setFreeDeliveryAbove(s.freeDeliveryAbove || 499);
          setEstimatedDeliveryTime(s.estimatedDeliveryTime || "30-45 mins");
          setTaxEnabled(s.taxEnabled || false);
          setTaxPercentage(s.taxPercentage || 5);
          setCodEnabled(s.codEnabled !== false);
          setUpiEnabled(s.upiEnabled !== false);
          setUpiId(s.upiId || "panditji@upi");
          setOnlinePaymentEnabled(s.onlinePaymentEnabled !== false);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      restaurantName,
      tagline,
      phone,
      email,
      address,
      openingHours,
      whatsappNumber,
      whatsappOrdersEnabled,
      acceptOrders,
      deliveryEnabled,
      pickupEnabled,
      minOrderAmount: Number(minOrderAmount),
      deliveryFee: Number(deliveryFee),
      freeDeliveryAbove: Number(freeDeliveryAbove),
      estimatedDeliveryTime,
      taxEnabled,
      taxPercentage: Number(taxPercentage),
      codEnabled,
      upiEnabled,
      upiId,
      onlinePaymentEnabled,
    };

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update settings");
      }

      showToast("Restaurant settings & WhatsApp configuration saved! ✓");
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "Save error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-[#6c7b87]">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-serif-dhaba font-bold text-2xl md:text-3xl text-[#102a43]">
          Restaurant & WhatsApp Settings
        </h1>
        <p className="text-xs text-[#6c7b87]">
          Configure official contact information, dynamic WhatsApp number, delivery fees, taxes, and payment gateways.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* WhatsApp Configuration Box */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-[#25D366]/40 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e9e1d4]">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#25D366] fill-current" />
              <h2 className="font-serif-dhaba font-bold text-lg text-[#102a43]">
                WhatsApp Order System Configuration
              </h2>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={whatsappOrdersEnabled}
                onChange={(e) => setWhatsappOrdersEnabled(e.target.checked)}
                className="rounded"
              />
              <span className="font-bold text-[#102a43]">Enable WhatsApp Button</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#102a43] mb-1">
                Restaurant WhatsApp Number (Country Code + 10 digits) *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. 919876543210"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full p-3 border border-[#ddd8cf] rounded-xl outline-none font-mono font-bold"
              />
              <span className="text-[10px] text-[#6c7b87] mt-1 block">
                This dynamic number is used when customer clicks &quot;Send Order on WhatsApp&quot;.
              </span>
            </div>
          </div>
        </div>

        {/* Business Contact Info */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e9e1d4] shadow-sm space-y-4">
          <h2 className="font-serif-dhaba font-bold text-lg text-[#102a43] pb-2 border-b border-[#e9e1d4]">
            General Restaurant Identity
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#102a43] mb-1">
                Restaurant Name
              </label>
              <input
                required
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full p-3 border border-[#ddd8cf] rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#102a43] mb-1">
                Tagline
              </label>
              <input
                required
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full p-3 border border-[#ddd8cf] rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#102a43] mb-1">
                Public Phone (Call Us)
              </label>
              <input
                required
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 border border-[#ddd8cf] rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#102a43] mb-1">
                Email Address
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-[#ddd8cf] rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#102a43] mb-1">
                Full Physical Address
              </label>
              <input
                required
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 border border-[#ddd8cf] rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#102a43] mb-1">
                Opening Hours
              </label>
              <input
                required
                type="text"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                className="w-full p-3 border border-[#ddd8cf] rounded-xl outline-none"
              />
            </div>
          </div>
        </div>

        {/* Order & Delivery Thresholds */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e9e1d4] shadow-sm space-y-4">
          <h2 className="font-serif-dhaba font-bold text-lg text-[#102a43] pb-2 border-b border-[#e9e1d4]">
            Delivery & Ordering Controls
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="p-3 bg-[#fbf7ef] rounded-xl border border-[#e9e1d4] flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptOrders}
                onChange={(e) => setAcceptOrders(e.target.checked)}
                className="rounded"
              />
              <span className="font-bold text-[#102a43]">Accept New Orders</span>
            </label>

            <label className="p-3 bg-[#fbf7ef] rounded-xl border border-[#e9e1d4] flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={deliveryEnabled}
                onChange={(e) => setDeliveryEnabled(e.target.checked)}
                className="rounded"
              />
              <span className="font-bold text-[#102a43]">Delivery Enabled</span>
            </label>

            <label className="p-3 bg-[#fbf7ef] rounded-xl border border-[#e9e1d4] flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={pickupEnabled}
                onChange={(e) => setPickupEnabled(e.target.checked)}
                className="rounded"
              />
              <span className="font-bold text-[#102a43]">Pickup Enabled</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block font-bold text-[#102a43] mb-1">
                Min. Order Amount (₹)
              </label>
              <input
                type="number"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                className="w-full p-2.5 border border-[#ddd8cf] rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#102a43] mb-1">
                Standard Delivery Fee (₹)
              </label>
              <input
                type="number"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(Number(e.target.value))}
                className="w-full p-2.5 border border-[#ddd8cf] rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#102a43] mb-1">
                Free Delivery Above (₹)
              </label>
              <input
                type="number"
                value={freeDeliveryAbove}
                onChange={(e) => setFreeDeliveryAbove(Number(e.target.value))}
                className="w-full p-2.5 border border-[#ddd8cf] rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#102a43] mb-1">
                Estimated Delivery Time
              </label>
              <input
                type="text"
                value={estimatedDeliveryTime}
                onChange={(e) => setEstimatedDeliveryTime(e.target.value)}
                className="w-full p-2.5 border border-[#ddd8cf] rounded-xl outline-none"
              />
            </div>
          </div>
        </div>

        {/* Payment Gateways & Tax Settings */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e9e1d4] shadow-sm space-y-4">
          <h2 className="font-serif-dhaba font-bold text-lg text-[#102a43] pb-2 border-b border-[#e9e1d4]">
            Payment Methods & Taxes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="p-3 bg-[#fbf7ef] rounded-xl border border-[#e9e1d4] flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={codEnabled}
                onChange={(e) => setCodEnabled(e.target.checked)}
                className="rounded"
              />
              <span className="font-bold text-[#102a43]">Cash on Delivery (COD)</span>
            </label>

            <label className="p-3 bg-[#fbf7ef] rounded-xl border border-[#e9e1d4] flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={upiEnabled}
                onChange={(e) => setUpiEnabled(e.target.checked)}
                className="rounded"
              />
              <span className="font-bold text-[#102a43]">UPI QR / ID Payment</span>
            </label>

            <label className="p-3 bg-[#fbf7ef] rounded-xl border border-[#e9e1d4] flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onlinePaymentEnabled}
                onChange={(e) => setOnlinePaymentEnabled(e.target.checked)}
                className="rounded"
              />
              <span className="font-bold text-[#102a43]">Online Payment (Razorpay)</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block font-bold text-[#102a43] mb-1">
                Restaurant UPI ID (e.g. for QR payments)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full p-2.5 border border-[#ddd8cf] rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#102a43] mb-1">
                Enable GST / Tax on Orders
              </label>
              <div className="pt-2">
                <input
                  type="checkbox"
                  id="taxCheck"
                  checked={taxEnabled}
                  onChange={(e) => setTaxEnabled(e.target.checked)}
                  className="rounded mr-2"
                />
                <label htmlFor="taxCheck" className="font-bold text-[#102a43]">
                  Apply GST / Tax
                </label>
              </div>
            </div>

            {taxEnabled && (
              <div>
                <label className="block font-bold text-[#102a43] mb-1">
                  Tax Percentage (%)
                </label>
                <input
                  type="number"
                  value={taxPercentage}
                  onChange={(e) => setTaxPercentage(Number(e.target.value))}
                  className="w-full p-2.5 border border-[#ddd8cf] rounded-xl outline-none"
                />
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-dhaba btn-dhaba-gold py-3 px-8 text-xs font-bold flex items-center gap-2 disabled:opacity-50 shadow-lg"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving All Settings..." : "Save Restaurant Settings"}</span>
        </button>
      </form>
    </div>
  );
}
