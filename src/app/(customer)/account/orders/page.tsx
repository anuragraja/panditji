"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { IOrder } from "@/types";
import { ArrowLeft, Repeat, FileText, ArrowRight } from "lucide-react";

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { addToCart, openCart } = useCart();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<IOrder[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetch("/api/orders")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.orders) {
            setOrders(data.orders);
          }
        })
        .catch((err) => console.error("Error fetching orders:", err))
        .finally(() => setFetching(false));
    }
  }, [user, isLoading, router]);

  const handleReorder = (order: IOrder) => {
    order.items.forEach((it) => {
      // Re-add each item into the cart
      addToCart(
        {
          _id: it.menuItemId,
          name: it.name,
          hindiName: it.hindiName,
          slug: it.name.toLowerCase().replace(/\s+/g, "-"),
          description: "",
          category: "Reorder",
          image: it.image || "",
          foodType: it.foodType,
          basePrice: it.unitPrice,
          available: true,
          featured: false,
          popular: false,
          todaySpecial: false,
        },
        it.selectedVariant,
        it.selectedAddOns,
        it.specialInstructions,
        it.quantity
      );
    });

    showToast(`Items from order #${order.orderNumber} added to cart!`);
    openCart();
  };

  return (
    <div className="bg-[#fbf7ef] min-h-screen py-10">
      <div className="container-dhaba max-w-4xl space-y-6">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#526575] hover:text-[#102a43]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Account</span>
        </Link>

        <h1 className="font-serif-dhaba font-extrabold text-3xl text-[#102a43]">
          My Order History
        </h1>

        {fetching ? (
          <div className="bg-white rounded-3xl p-12 text-center text-xs text-[#6c7b87] border border-[#e9e1d4]">
            Loading your orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#e9e1d4] shadow-sm space-y-4">
            <span className="text-5xl block">🧾</span>
            <h2 className="font-serif-dhaba font-bold text-2xl text-[#102a43]">
              No Orders Found
            </h2>
            <p className="text-xs text-[#6c7b87]">
              You haven&apos;t placed any orders yet. Treat yourself to our delicious dishes!
            </p>
            <Link href="/#menu" className="btn-dhaba btn-dhaba-gold mt-2">
              Explore Our Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => (
              <div
                key={ord._id}
                className="bg-white rounded-3xl p-6 border border-[#e9e1d4] shadow-sm space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#e9e1d4]">
                  <div>
                    <div className="flex items-center gap-2">
                      <b className="font-serif-dhaba font-bold text-lg text-[#102a43]">
                        {ord.orderNumber}
                      </b>
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#f5ead5] text-[#9a6714] uppercase">
                        {ord.orderStatus.replace(/_/g, " ")}
                      </span>
                    </div>
                    <span className="text-xs text-[#6c7b87]">
                      {formatDateTime(ord.createdAt)} • {ord.orderType}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-serif-dhaba font-black text-xl text-[#102a43] block">
                      {formatCurrency(ord.total)}
                    </span>
                    <span className="text-[11px] text-[#6c7b87]">
                      {ord.paymentMethod} ({ord.paymentStatus})
                    </span>
                  </div>
                </div>

                {/* Items in order */}
                <div className="divide-y divide-[#e9e1d4]/40 py-1">
                  {ord.items.map((it, idx) => (
                    <div key={idx} className="py-2 first:pt-0 flex justify-between text-xs">
                      <div>
                        <b className="text-[#102a43]">{it.name}</b>
                        <span className="text-[#6c7b87] block">
                          {it.quantity} × {formatCurrency(it.unitPrice)}
                          {it.selectedVariant ? ` (${it.selectedVariant.name})` : ""}
                        </span>
                      </div>
                      <span className="font-bold text-[#102a43]">
                        {formatCurrency(it.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="pt-3 border-t border-[#e9e1d4] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReorder(ord)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9a6714] bg-[#f5ead5] hover:bg-[#d99a2b] hover:text-white px-3.5 py-2 rounded-xl transition-all"
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      <span>Reorder Dishes</span>
                    </button>

                    <Link
                      href={`/receipt/${ord.orderNumber}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#102a43] bg-[#fbf7ef] hover:bg-[#eee7da] px-3.5 py-2 rounded-xl border border-[#e9e1d4] transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Receipt</span>
                    </Link>
                  </div>

                  <Link
                    href={`/track-order/${ord.orderNumber}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#102a43] hover:bg-[#183b5b] px-4 py-2 rounded-xl transition-colors"
                  >
                    <span>Track Status</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
