"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Lock, Phone, ArrowRight } from "lucide-react";

export default function LoginPage() {
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
        throw new Error(data.message || "Failed to log in");
      }

      login(data.user);
      showToast("Welcome back! Logged in successfully.");

      if (data.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/account");
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fbf7ef] min-h-screen py-16 flex items-center justify-center">
      <div className="container-dhaba max-w-md">
        <div className="bg-white rounded-3xl p-8 border border-[#e9e1d4] shadow-dhaba">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#102a43] text-white flex items-center justify-center font-black text-lg border-2 border-[#d99a2b] mx-auto mb-3">
              PJ
            </div>
            <h1 className="font-serif-dhaba font-bold text-2xl text-[#102a43]">
              Welcome Back
            </h1>
            <p className="text-xs text-[#6c7b87] mt-1">
              Log in to Pandit Ji Ka Dhaba to manage your orders & addresses.
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
                Phone Number or Email
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#6c7b87] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="text"
                  placeholder="e.g. 9876543210 or email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 text-xs border border-[#ddd8cf] rounded-xl outline-none focus:border-[#d99a2b] bg-white text-[#172b3a]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-[#102a43]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-bold text-[#d99a2b] hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6c7b87] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="password"
                  placeholder="Enter your password"
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
              <span>{loading ? "Logging in..." : "Log In"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#e9e1d4] text-center text-xs text-[#6c7b87]">
            Don&apos;t have an account yet?{" "}
            <Link href="/register" className="font-bold text-[#d99a2b] hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
