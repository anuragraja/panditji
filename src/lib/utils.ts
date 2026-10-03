import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000); // 4 digit random
  return `PJD-${year}${month}${day}-${random}`;
}

export function sanitizeIndianPhone(phone: string): string {
  const clean = phone.replace(/\D/g, "");
  if (clean.length === 10) {
    return `91${clean}`;
  }
  if (clean.length === 12 && clean.startsWith("91")) {
    return clean;
  }
  return clean;
}

export function isValidIndianPhone(phone: string): boolean {
  const clean = phone.replace(/\D/g, "");
  return (clean.length === 10 && /^[6-9]\d{9}$/.test(clean)) || (clean.length === 12 && /^91[6-9]\d{9}$/.test(clean));
}
