"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { IUserAddress } from "@/types";
import { ArrowLeft, Plus, MapPin, Trash2, Home, Briefcase, Check } from "lucide-react";

export default function AddressesPage() {
  const { user, login } = useAuth();
  const { showToast } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const [label, setLabel] = useState("Home");
  const [houseNumber, setHouseNumber] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("Bhopal");
  const [state, setState] = useState("Madhya Pradesh");
  const [pincode, setPincode] = useState("462001");
  const [isDefault, setIsDefault] = useState(false);

  const addresses = user?.addresses || [];

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!houseNumber || !street || !pincode) return;

    setSaving(true);
    const newAddress: IUserAddress = {
      label,
      houseNumber,
      street,
      landmark,
      city,
      state,
      pincode,
      isDefault: isDefault || addresses.length === 0,
    };

    const updatedAddresses = isDefault
      ? [...addresses.map((a) => ({ ...a, isDefault: false })), newAddress]
      : [...addresses, newAddress];

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses: updatedAddresses }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to add address");
      }

      login(data.user);
      showToast("New address saved! ✓");
      setIsAdding(false);
      setHouseNumber("");
      setStreet("");
      setLandmark("");
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (index: number) => {
    const updated = addresses.filter((_, i) => i !== index);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses: updated }),
      });
      const data = await res.json();
      if (data.success) {
        login(data.user);
        showToast("Address deleted ✓");
      }
    } catch {
      showToast("Failed to delete address");
    }
  };

  return (
    <div className="bg-[#fbf7ef] min-h-screen py-10">
      <div className="container-dhaba max-w-2xl space-y-6">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#526575] hover:text-[#102a43]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Account</span>
        </Link>

        <div className="flex items-center justify-between">
          <h1 className="font-serif-dhaba font-extrabold text-2xl text-[#102a43]">
            Saved Delivery Addresses
          </h1>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="btn-dhaba btn-dhaba-gold py-2 px-3 text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          )}
        </div>

        {/* Add Address Form */}
        {isAdding && (
          <div className="bg-white rounded-3xl p-6 border border-[#e9e1d4] shadow-sm animate-in fade-in duration-200">
            <h2 className="font-serif-dhaba font-bold text-lg text-[#102a43] mb-4">
              Add New Address
            </h2>

            <form onSubmit={handleAddAddress} className="space-y-4">
              <div className="flex gap-2">
                {["Home", "Work", "Other"].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLabel(l)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                      label === l
                        ? "border-[#d99a2b] bg-[#f5ead5] text-[#102a43]"
                        : "border-[#ddd8cf] bg-white text-[#526575]"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#102a43] mb-1">
                    Flat / House No. *
                  </label>
                  <input
                    required
                    type="text"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    className="w-full p-2.5 text-xs border border-[#ddd8cf] rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#102a43] mb-1">
                    Street / Area *
                  </label>
                  <input
                    required
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full p-2.5 text-xs border border-[#ddd8cf] rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#102a43] mb-1">
                    Landmark
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full p-2.5 text-xs border border-[#ddd8cf] rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#102a43] mb-1">
                    Pincode *
                  </label>
                  <input
                    required
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full p-2.5 text-xs border border-[#ddd8cf] rounded-xl outline-none"
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
                    className="w-full p-2.5 text-xs border border-[#ddd8cf] rounded-xl outline-none"
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
                    className="w-full p-2.5 text-xs border border-[#ddd8cf] rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="defaultCheck"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-[#ddd8cf]"
                />
                <label htmlFor="defaultCheck" className="text-xs text-[#172b3a] font-medium">
                  Set as default delivery address
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-dhaba btn-dhaba-gold py-2 px-4 text-xs font-bold disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Address"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="btn-dhaba bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Existing Addresses List */}
        {addresses.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center text-xs text-[#6c7b87] border border-[#e9e1d4]">
            No saved addresses. Add your home or office address for 1-click checkout!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-[#e9e1d4] shadow-sm flex flex-col justify-between space-y-3 relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-black text-[#102a43]">
                      {addr.label === "Home" ? (
                        <Home className="w-3.5 h-3.5 text-[#d99a2b]" />
                      ) : (
                        <Briefcase className="w-3.5 h-3.5 text-[#246b9b]" />
                      )}
                      <span>{addr.label || "Address"}</span>
                    </span>

                    {addr.isDefault && (
                      <span className="text-[10px] bg-[#f5ead5] text-[#9a6714] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Default
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#172b3a] leading-relaxed">
                    {addr.houseNumber}, {addr.street}
                    {addr.landmark ? `, Near ${addr.landmark}` : ""}
                    <br />
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#e9e1d4]/40 flex justify-end">
                  <button
                    onClick={() => handleDeleteAddress(idx)}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
