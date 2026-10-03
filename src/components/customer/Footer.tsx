import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#091d2d] text-[#c4d0d7]">
      <div className="container-dhaba py-[30px] flex justify-between items-center gap-5 max-md:grid">
        <Link href="/" className="flex items-center gap-3 text-white">
          <div className="w-[48px] h-[48px] rounded-full overflow-hidden border-2 border-[#d99a2b] shadow-brand flex-shrink-0 bg-white">
            <img
              src="/images/logo.png"
              alt="Pandit Ji Ka Dhaba Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif-dhaba font-extrabold text-[19px] leading-tight text-white">
              Pandit Ji
            </span>
            <span className="text-[8px] font-extrabold tracking-[3px] text-[#d99a2b] uppercase">
              KA DHABA
            </span>
          </div>
        </Link>

        <p className="text-[12px] text-[#93a4ae]">
          Authentic Indian flavours. Fresh food. Warm hospitality.
        </p>

        <div className="text-[12px] text-[#d5e0e6] flex items-center gap-3">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>•</span>
          <Link href="/#menu" className="hover:text-white transition-colors">
            Menu
          </Link>
          <span>•</span>
          <Link href="/#contact" className="hover:text-white transition-colors">
            Contact
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms
          </Link>
        </div>
      </div>

      <div className="text-center border-t border-white/[0.08] py-4 text-[10px] text-[#81929d]">
        © {new Date().getFullYear()} Pandit Ji Ka Dhaba • All rights reserved. • घर का स्वाद
      </div>
    </footer>
  );
}
