"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Phone, Send } from "lucide-react";

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-[#fbf7ef] min-h-screen py-16 flex items-center justify-center">
      <div className="container-dhaba max-w-md">
        <div className="bg-white rounded-3xl p-8 border border-[#e9e1d4] shadow-dhaba text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#526575] hover:text-[#102a43] mb-6 float-left"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
          <div className="clear-both" />

          <h1 className="font-serif-dhaba font-bold text-2xl text-[#102a43] mb-2">
            Reset Your Password
          </h1>
          <p className="text-xs text-[#6c7b87] mb-6">
            Enter your registered phone number. We will send a WhatsApp or SMS verification code to reset your password.
          </p>

          {submitted ? (
            <div className="bg-[#fbf7ef] p-5 rounded-2xl border border-[#d99a2b]/30 text-center space-y-3">
              <span className="text-3xl block">📲</span>
              <p className="text-xs font-bold text-[#2d7a52]">
                Verification request sent to {phone}!
              </p>
              <p className="text-[11px] text-[#6c7b87]">
                Please check your phone or contact restaurant support directly.
              </p>
              <Link href="/login" className="btn-dhaba btn-dhaba-gold py-2 px-4 text-xs block mx-auto">
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-[#102a43] mb-1">
                  Registered Phone Number
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

              <button
                type="submit"
                className="w-full btn-dhaba btn-dhaba-gold py-3 text-xs font-bold flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Reset Link</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
