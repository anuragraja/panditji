"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Lock, Phone, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid credentials");
      }

      if (data.user.role !== "ADMIN") {
        throw new Error("Access restricted. This account does not have Admin privileges.");
      }

      login(data.user);
      showToast("Admin access granted. Welcome to Dhaba Dashboard!");
      router.push("/admin");
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Failed to log in as administrator.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#091d2d] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 md:p-10 shadow-2xl border border-white/20">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6c7b87] hover:text-[#102a43] mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Dhaba</span>
        </Link>

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#102a43] text-white flex items-center justify-center font-black text-xl border-2 border-[#d99a2b] mx-auto mb-3 shadow-brand">
            PJ
          </div>
          <span className="text-[10px] font-black tracking-widest text-[#d99a2b] uppercase block">
            RESTAURANT MANAGEMENT
          </span>
          <h1 className="font-serif-dhaba font-bold text-2xl text-[#102a43] mt-1">
            Admin Portal Login
          </h1>
          <p className="text-xs text-[#6c7b87] mt-1">
            Sign in to manage kitchen orders, menu, and restaurant settings.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#102a43] mb-1">
              Admin Phone or Email
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#6c7b87] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                required
                type="text"
                placeholder="Admin Phone or Email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-9 pr-3 py-3 text-xs border border-[#ddd8cf] rounded-xl outline-none focus:border-[#d99a2b] bg-white text-[#172b3a]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#102a43] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#6c7b87] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                required
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-3 text-xs border border-[#ddd8cf] rounded-xl outline-none focus:border-[#d99a2b] bg-white text-[#172b3a]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-dhaba bg-[#102a43] hover:bg-[#183b5b] text-white py-3.5 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 mt-2 shadow-lg"
          >
            <ShieldCheck className="w-4 h-4 text-[#f2c35e]" />
            <span>{loading ? "Authenticating..." : "Access Admin Dashboard"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[11px] text-[#89959e] text-center mt-6">
          Need initial admin credentials? Run <code className="bg-gray-100 px-1 py-0.5 rounded">npm run create-admin</code> in terminal.
        </p>
      </div>
    </div>
  );
}
