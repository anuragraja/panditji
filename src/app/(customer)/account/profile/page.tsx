"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { ArrowLeft, Save, User as UserIcon, Mail, Phone } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, login, isLoading } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [user, isLoading, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update profile");
      }

      login(data.user);
      showToast("Profile updated successfully! ✓");
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "Update error");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !user) return null;

  return (
    <div className="bg-[#fbf7ef] min-h-screen py-10">
      <div className="container-dhaba max-w-xl space-y-6">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#526575] hover:text-[#102a43]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Account</span>
        </Link>

        <div className="bg-white rounded-3xl p-8 border border-[#e9e1d4] shadow-dhaba">
          <h1 className="font-serif-dhaba font-extrabold text-2xl text-[#102a43] mb-6">
            Personal Information
          </h1>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#102a43] mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#6c7b87] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 text-xs border border-[#ddd8cf] rounded-xl outline-none focus:border-[#d99a2b] bg-white text-[#172b3a]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#102a43] mb-1">
                Phone Number (Primary Login ID)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#6c7b87] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  disabled
                  type="tel"
                  value={phone}
                  className="w-full pl-9 pr-3 py-3 text-xs border border-[#ddd8cf] rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <span className="text-[10px] text-[#6c7b87] mt-1 block">
                Phone number is locked for account verification.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#102a43] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6c7b87] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. anurag@example.com"
                  className="w-full pl-9 pr-3 py-3 text-xs border border-[#ddd8cf] rounded-xl outline-none focus:border-[#d99a2b] bg-white text-[#172b3a]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-dhaba btn-dhaba-gold py-3 px-6 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
