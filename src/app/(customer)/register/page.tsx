"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Lock, Phone, User as UserIcon, Mail, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Registration failed");
      }

      login(data.user);
      showToast("Account created successfully! Welcome to Pandit Ji Ka Dhaba.");
      router.push("/account");
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fbf7ef] min-h-screen py-16 flex items-center justify-center">
      <div className="container-dhaba max-w-md">
        <div className="bg-white rounded-3xl p-8 border border-[#e9e1d4] shadow-dhaba">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#d99a2b] mx-auto mb-3 shadow-brand bg-white">
              <img
                src="/images/logo.png"
                alt="Pandit Ji Ka Dhaba"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="font-serif-dhaba font-bold text-2xl text-[#102a43]">
              Create Your Account
            </h1>
            <p className="text-xs text-[#6c7b87] mt-1">
              Join Pandit Ji Ka Dhaba for quick checkout, saved addresses, and live order tracking.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-200">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#102a43] mb-1">
                Full Name *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#6c7b87] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="text"
                  placeholder="e.g. Anurag Rajak"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 text-xs border border-[#ddd8cf] rounded-xl outline-none focus:border-[#d99a2b] bg-white text-[#172b3a]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#102a43] mb-1">
                Phone Number (10 digits) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#6c7b87] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 text-xs border border-[#ddd8cf] rounded-xl outline-none focus:border-[#d99a2b] bg-white text-[#172b3a]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#102a43] mb-1">
                Email Address (Optional)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6c7b87] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="e.g. anurag@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 text-xs border border-[#ddd8cf] rounded-xl outline-none focus:border-[#d99a2b] bg-white text-[#172b3a]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#102a43] mb-1">
                Password (min 6 characters) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6c7b87] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="password"
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 text-xs border border-[#ddd8cf] rounded-xl outline-none focus:border-[#d99a2b] bg-white text-[#172b3a]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-dhaba btn-dhaba-gold py-3 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <span>{loading ? "Creating Account..." : "Register Now"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#e9e1d4] text-center text-xs text-[#6c7b87]">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-[#d99a2b] hover:underline">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
