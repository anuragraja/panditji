"use client";

import React from "react";
import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="btn-dhaba btn-dhaba-gold py-2.5 px-4 text-xs font-bold flex items-center gap-2 shadow-sm"
    >
      <Printer className="w-4 h-4" />
      <span>Print Receipt</span>
    </button>
  );
}
