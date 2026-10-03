"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { formatCurrency } from "@/lib/utils";
import { OrderType, PaymentMethod, IUserAddress } from "@/types";
import { ArrowLeft, MapPin, Bike, ShoppingBag, ShieldCheck, Tag, CreditCard, Banknote, QrCode } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [orderType, setOrderType] = useState<OrderType>("DELIVERY");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");

  // Address fields
  const [houseNumber, setHouseNumber] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("Bhopal");
  const [state, setState] = useState("Madhya Pradesh");
  const [pincode, setPincode] = useState("462001");

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.phone) setCustomerPhone(user.phone);
      if (user.email) setCustomerEmail(user.email);

      // If user has saved addresses, pre-fill default
      if (user.addresses && user.addresses.length > 0) {
        const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
        setHouseNumber(def.houseNumber);
        setStreet(def.street);
        setLandmark(def.landmark || "");
        setCity(def.city);
        setState(def.state);
        setPincode(def.pincode);
      }
    }
  }, [user]);

  const selectSavedAddress = (addr: IUserAddress) => {
    setHouseNumber(addr.houseNumber);
    setStreet(addr.street);
    setLandmark(addr.landmark || "");
    setCity(addr.city);
    setState(addr.state);
    setPincode(addr.pincode);
    showToast("Address loaded ✓");
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid coupon");
      }
      setAppliedCoupon({
        code: data.coupon.code,
        discountAmount: data.coupon.discountAmount,
      });
      showToast(`Coupon ${data.coupon.code} applied!`);
    } catch (err: unknown) {
      const error = err as Error;
      setCouponError(error.message || "Invalid coupon code");
      setAppliedCoupon(null);
    }
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const deliveryFee = orderType === "DELIVERY" ? (subtotal >= 499 ? 0 : 30) : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setSubmitError("Your cart is empty. Please add items.");
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setSubmitError("Please fill in your name and phone number.");
      return;
    }

    if (orderType === "DELIVERY" && (!houseNumber.trim() || !street.trim() || !pincode.trim())) {
      setSubmitError("Please provide your complete delivery address.");
      return;
    }

    setLoading(true);
    setSubmitError("");

    try {
      const payload = {
        name: customerName.trim(),
        phone: customerPhone.trim(),
        email: customerEmail.trim() || undefined,
        orderType,
        deliveryAddress:
          orderType === "DELIVERY"
            ? {
                houseNumber: houseNumber.trim(),
                street: street.trim(),
                landmark: landmark.trim(),
                city: city.trim(),
                state: state.trim(),
                pincode: pincode.trim(),
              }
            : undefined,
        items: items.map((it) => ({
          menuItemId: it.menuItemId,
          quantity: it.quantity,
          selectedVariant: it.selectedVariant,
          selectedAddOns: it.selectedAddOns,
          specialInstructions: it.specialInstructions,
        })),
        couponCode: appliedCoupon ? appliedCoupon.code : "",
        paymentMethod,
        notes: orderNotes.trim(),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to place order.");
      }

      const createdOrder = data.order;

      // Handle Razorpay Online Payment Flow if selected
      if (paymentMethod === "RAZORPAY") {
        try {
          const rzpRes = await fetch("/api/payments/razorpay/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: createdOrder._id }),
          });
          const rzpData = await rzpRes.json();

          if (rzpData.success && rzpData.razorpayOrder) {
            // For now, redirect to order success with payment verification pending
            clearCart();
            router.push(`/order-success/${createdOrder.orderNumber}?paid=1`);
            return;
          }
        } catch (e) {
          console.error("Razorpay trigger error:", e);
        }
      }

      clearCart();
      router.push(`/order-success/${createdOrder.orderNumber}`);
    } catch (err: unknown) {
      const error = err as Error;
      setSubmitError(error.message || "Failed to submit order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-[#fbf7ef] min-h-screen py-16 text-center">
        <div className="container-dhaba max-w-md bg-white p-8 rounded-3xl border border-[#e9e1d4] shadow-sm space-y-4">
          <span className="text-5xl block">🛒</span>
          <h2 className="font-serif-dhaba font-bold text-2xl text-[#102a43]">
            Your Cart is Empty
          </h2>
          <p className="text-xs text-[#6c7b87]">
            Please add dishes from our menu before proceeding to checkout.
          </p>
          <Link href="/#menu" className="btn-dhaba btn-dhaba-gold inline-block">
            View Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fbf7ef] min-h-screen py-10">
      <div className="container-dhaba max-w-5xl">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#526575] hover:text-[#102a43] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </Link>

        <h1 className="font-serif-dhaba font-extrabold text-3xl text-[#102a43] mb-8">
          Complete Your Order
        </h1>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Order Type (Delivery vs Pickup) */}
            <div className="bg-white rounded-3xl p-6 border border-[#e9e1d4] shadow-sm">
              <h2 className="font-serif-dhaba font-bold text-lg text-[#102a43] mb-4 flex items-center gap-2">
                <span>1. Order Type</span>
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOrderType("DELIVERY")}
                  className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    orderType === "DELIVERY"
                      ? "border-[#d99a2b] bg-[#f5ead5]/40 text-[#102a43] font-bold shadow-sm"
                      : "border-[#e9e1d4] bg-white text-[#526575]"
                  }`}
                >
                  <Bike className="w-6 h-6 text-[#d99a2b]" />
                  <div>
                    <span className="block text-sm font-bold">Home Delivery</span>
                    <span className="block text-[11px] text-[#6c7b87]">
                      Delivered hot to your door
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderType("PICKUP")}
                  className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    orderType === "PICKUP"
                      ? "border-[#d99a2b] bg-[#f5ead5]/40 text-[#102a43] font-bold shadow-sm"
                      : "border-[#e9e1d4] bg-white text-[#526575]"
                  }`}
                >
                  <ShoppingBag className="w-6 h-6 text-[#246b9b]" />
                  <div>
                    <span className="block text-sm font-bold">Self Pickup</span>
                    <span className="block text-[11px] text-[#6c7b87]">
                      Collect at Dhaba Counter
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Customer Contact Details */}
            <div className="bg-white rounded-3xl p-6 border border-[#e9e1d4] shadow-sm">
              <h2 className="font-serif-dhaba font-bold text-lg text-[#102a43] mb-4">
                2. Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#102a43] mb-1">
                    Full Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Anurag Rajak"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-3 text-xs border border-[#ddd8cf] rounded-xl outline-none focus:border-[#d99a2b] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#102a43] mb-1">
                    Phone Number (WhatsApp Ready) *
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full p-3 text-xs border border-[#ddd8cf] rounded-xl outline-none focus:border-[#d99a2b] bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#102a43] mb-1">
                    Email Address (Optional, for bill receipt)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. anurag@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full p-3 text-xs border border-[#ddd8cf] rounded-xl outline-none focus:border-[#d99a2b] bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 3. Delivery Address (if Delivery selected) */}
            {orderType === "DELIVERY" && (
              <div className="bg-white rounded-3xl p-6 border border-[#e9e1d4] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif-dhaba font-bold text-lg text-[#102a43] flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#d99a2b]" />
                    <span>3. Delivery Address</span>
                  </h2>
                </div>

                {/* Saved addresses selector if user is logged in */}
                {user?.addresses && user.addresses.length > 0 && (
                  <div className="mb-4 p-3 bg-[#fbf7ef] rounded-2xl border border-[#e9e1d4]">
                    <span className="text-xs font-bold text-[#102a43] block mb-2">
                      Choose from saved addresses:
                    </span>
                    <div className="flex gap-2 flex-wrap">
                      {user.addresses.map((addr, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => selectSavedAddress(addr)}
                          className="px-3 py-1.5 rounded-lg border border-[#d99a2b]/40 text-xs font-bold bg-white hover:bg-[#d99a2b] hover:text-white transition-colors"
                        >
                          {addr.label || "Saved Address"}: {addr.houseNumber}, {addr.street}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#102a43] mb-1">
                      House / Flat / Floor No. *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Flat 302, Green Heights"
                      value={houseNumber}
                      onChange={(e) => setHouseNumber(e.target.value)}
                      className="w-full p-3 text-xs border border-[#ddd8cf] rounded-xl outline-none focus:border-[#d99a2b] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#102a43] mb-1">
                      Street / Colony / Area *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Near Bamitha Chowk, Chhatarpur"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full p-3 text-xs border border-[#ddd8cf] rounded-xl outline-none focus:border-[#d99a2b] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#102a43] mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Near Shiv Mandir"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full p-3 text-xs border border-[#ddd8cf] rounded-xl outline-none focus:border-[#d99a2b] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#102a43] mb-1">
                      Pincode *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. 471105"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full p-3 text-xs border border-[#ddd8cf] rounded-xl outline-none focus:border-[#d99a2b] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#102a43] mb-1">
                      City *
                    </label>
                    <input
                      required
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-3 text-xs border border-[#ddd8cf] rounded-xl outline-none focus:border-[#d99a2b] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#102a43] mb-1">
                      State *
                    </label>
                    <input
                      required
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full p-3 text-xs border border-[#ddd8cf] rounded-xl outline-none focus:border-[#d99a2b] bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. Payment Method */}
            <div className="bg-white rounded-3xl p-6 border border-[#e9e1d4] shadow-sm">
              <h2 className="font-serif-dhaba font-bold text-lg text-[#102a43] mb-4">
                {orderType === "DELIVERY" ? "4. Payment Method" : "3. Payment Method"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === "COD"
                      ? "border-[#d99a2b] bg-[#f5ead5]/40 text-[#102a43] font-bold shadow-sm"
                      : "border-[#e9e1d4] bg-white text-[#526575]"
                  }`}
                >
                  <Banknote className="w-6 h-6 text-[#2d7a52] mb-2" />
                  <div>
                    <span className="block text-xs font-bold">Cash on Delivery</span>
                    <span className="block text-[10px] text-[#6c7b87]">
                      Pay when food arrives
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("UPI")}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === "UPI"
                      ? "border-[#d99a2b] bg-[#f5ead5]/40 text-[#102a43] font-bold shadow-sm"
                      : "border-[#e9e1d4] bg-white text-[#526575]"
                  }`}
                >
                  <QrCode className="w-6 h-6 text-[#246b9b] mb-2" />
                  <div>
                    <span className="block text-xs font-bold">UPI / QR Scan</span>
                    <span className="block text-[10px] text-[#6c7b87]">
                      GPay, PhonePe, Paytm
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("RAZORPAY")}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === "RAZORPAY"
                      ? "border-[#d99a2b] bg-[#f5ead5]/40 text-[#102a43] font-bold shadow-sm"
                      : "border-[#e9e1d4] bg-white text-[#526575]"
                  }`}
                >
                  <CreditCard className="w-6 h-6 text-[#9a6714] mb-2" />
                  <div>
                    <span className="block text-xs font-bold">Online Payment</span>
                    <span className="block text-[10px] text-[#6c7b87]">
                      Cards, Netbanking
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* 5. Order Notes */}
            <div className="bg-white rounded-3xl p-6 border border-[#e9e1d4] shadow-sm">
              <label className="block text-xs font-bold text-[#102a43] mb-1">
                Order Notes / Delivery Instructions
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Please send extra green chutney, less spicy..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full p-3 text-xs border border-[#ddd8cf] rounded-xl outline-none focus:border-[#d99a2b] bg-white resize-none"
              />
            </div>
          </div>

          {/* Right Summary Column */}
          <div className="space-y-4">
            {/* Coupon Box */}
            <div className="bg-white rounded-3xl p-5 border border-[#e9e1d4] shadow-sm">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="HAVE A COUPON?"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#ddd8cf] outline-none font-bold uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="btn-dhaba btn-dhaba-gold py-2 px-3 text-xs font-bold whitespace-nowrap"
                >
                  Apply
                </button>
              </div>
              {appliedCoupon && (
                <div className="flex items-center gap-1.5 text-xs text-[#2d7a52] font-bold mt-2">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Coupon {appliedCoupon.code} applied! (-{formatCurrency(appliedCoupon.discountAmount)})</span>
                </div>
              )}
              {couponError && (
                <p className="text-xs text-red-500 font-semibold mt-2">{couponError}</p>
              )}
            </div>

            {/* Order Items Preview */}
            <div className="bg-white rounded-3xl p-6 border border-[#e9e1d4] shadow-sm space-y-4">
              <h3 className="font-serif-dhaba font-bold text-lg text-[#102a43] pb-2 border-b border-[#e9e1d4]">
                Order Items ({items.length})
              </h3>

              <div className="divide-y divide-[#e9e1d4]/50 max-h-56 overflow-y-auto pr-1">
                {items.map((it) => (
                  <div key={it.id} className="py-2.5 first:pt-0 flex justify-between text-xs">
                    <div>
                      <b className="text-[#102a43]">{it.name}</b>
                      <span className="text-[#6c7b87] block">
                        {it.quantity} × {formatCurrency(it.unitPrice)}
                        {it.selectedVariant ? ` (${it.selectedVariant.name})` : ""}
                      </span>
                    </div>
                    <span className="font-bold text-[#102a43]">
                      {formatCurrency(it.unitPrice * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculation */}
              <div className="space-y-2 pt-3 border-t border-[#e9e1d4] text-xs">
                <div className="flex justify-between text-[#526575]">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#102a43]">{formatCurrency(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#2d7a52] font-bold">
                    <span>Discount</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#526575]">
                  <span>Delivery Charges</span>
                  <span className="font-bold text-[#102a43]">
                    {deliveryFee === 0 ? "FREE" : formatCurrency(deliveryFee)}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#e9e1d4] flex justify-between items-center text-base">
                  <span className="font-bold text-[#102a43]">Total Amount</span>
                  <b className="font-serif-dhaba font-black text-2xl text-[#102a43]">
                    {formatCurrency(grandTotal)}
                  </b>
                </div>
              </div>

              {submitError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-dhaba btn-dhaba-gold py-4 text-sm font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{loading ? "Placing Order..." : `Confirm Order (${formatCurrency(grandTotal)})`}</span>
              </button>

              <p className="text-[10px] text-center text-[#6c7b87]">
                By ordering, you agree to receive order status updates on your WhatsApp number.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
