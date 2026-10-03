"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Lock, Phone, ArrowRight } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

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

      if (redirectParam) {
        router.push(redirectParam);
      } else if (data.user.role === "ADMIN") {
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
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#d99a2b] mx-auto mb-3 shadow-brand bg-white">
              <img
                src="/images/logo.png"
                alt="Pandit Ji Ka Dhaba"
                className="w-full h-full object-cover"
              />
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
                <Phone className="w-4 h-4 text-[#6c7b87] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 9876543210 or email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full text-xs pl-10 pr-3.5 py-3 rounded-xl border border-[#ddd8cf] outline-none focus:border-[#d99a2b] bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-[#102a43]">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-bold text-[#d99a2b] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6c7b87] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-10 pr-3.5 py-3 rounded-xl border border-[#ddd8cf] outline-none focus:border-[#d99a2b] bg-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-dhaba btn-dhaba-gold py-3 text-xs font-black flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              <span>{loading ? "Signing In..." : "Sign In to Pandit Ji"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#e9e1d4] text-center text-xs text-[#6c7b87]">
            Don&apos;t have an account?{" "}
            <Link
              href={redirectParam ? `/register?redirect=${encodeURIComponent(redirectParam)}` : "/register"}
              className="font-bold text-[#d99a2b] hover:underline"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fbf7ef] flex items-center justify-center text-xs font-bold text-[#6c7b87]">Loading login...</div>}>
      <LoginForm />
    </Suspense>
  );
}
