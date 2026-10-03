"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { IOrder } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2, MessageSquare, Copy, Check, FileText, ArrowRight } from "lucide-react";

interface OrderSuccessClientProps {
  order: IOrder;
  whatsappUrl: string;
  whatsappText: string;
  whatsappOrdersEnabled?: boolean;
}

export function OrderSuccessClient({
  order,
  whatsappUrl,
  whatsappText,
  whatsappOrdersEnabled = true,
}: OrderSuccessClientProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#d99a2b", "#102a43", "#246b9b", "#f5d28d"],
      });
    } catch (e) {
      console.error("Confetti error:", e);
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(whatsappText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-[#e9e1d4] shadow-dhaba text-center space-y-6">
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-[#f5ead5] text-[#2d7a52] flex items-center justify-center mx-auto shadow-inner">
        <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
      </div>

      <div>
        <span className="text-xs font-black tracking-widest text-[#d99a2b] uppercase">
          DHANYAWAD! YOUR ORDER IS SAVED
        </span>
        <h1 className="font-serif-dhaba font-extrabold text-3xl text-[#102a43] mt-1">
          ORDER PLACED SUCCESSFULLY
        </h1>
        <p className="text-xs text-[#6c7b87] mt-2">
          Your order has been recorded in our kitchen system.
        </p>
      </div>

      {/* Order ID Card */}
      <div className="bg-[#fbf7ef] p-4 rounded-2xl border border-[#d99a2b]/30 inline-block w-full max-w-sm mx-auto">
        <span className="text-[11px] text-[#6c7b87] uppercase font-bold block">
          Order ID
        </span>
        <strong className="font-serif-dhaba font-bold text-2xl text-[#102a43] tracking-wide">
          {order.orderNumber}
        </strong>
        <div className="text-xs font-bold text-[#2d7a52] mt-1">
          Total: {formatCurrency(order.total)} • {order.paymentMethod}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        {whatsappOrdersEnabled && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-[#25D366]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <MessageSquare className="w-5 h-5 fill-current" />
            <span>Send Order on WhatsApp</span>
          </a>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Link
            href={`/track-order/${order.orderNumber}`}
            className="btn-dhaba bg-[#102a43] hover:bg-[#183b5b] text-white py-3.5 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <span>Track Order</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href={`/receipt/${order.orderNumber}`}
            className="btn-dhaba border border-[#102a43]/20 bg-white hover:bg-[#fbf7ef] text-[#102a43] py-3.5 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Receipt</span>
          </Link>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="text-xs font-bold text-[#6c7b87] hover:text-[#102a43] flex items-center justify-center gap-1.5 mx-auto pt-2"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-600" />
              <span className="text-green-600">Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Order Details</span>
            </>
          )}
        </button>
      </div>

      <p className="text-[11px] text-[#6c7b87] pt-2 border-t border-[#e9e1d4]">
        Even if you do not open WhatsApp, our kitchen staff has received your order on the Dhaba Dashboard.
      </p>
    </div>
  );
}
