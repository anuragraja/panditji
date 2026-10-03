"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { ICartItem, IMenuItem, IVariant, IAddOn } from "@/types";
import { useToast } from "./ToastContext";

interface CartContextType {
  items: ICartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (
    item: IMenuItem,
    variant?: IVariant,
    addOns?: IAddOn[],
    specialInstructions?: string,
    quantity?: number
  ) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function generateCartItemId(
  menuItemId: string,
  variant?: IVariant,
  addOns: IAddOn[] = [],
  instructions: string = ""
): string {
  const vKey = variant ? variant.name : "standard";
  const aKey = addOns
    .map((a) => a.name)
    .sort()
    .join("-");
  const iKey = instructions.trim().toLowerCase();
  return `${menuItemId}_${vKey}_${aKey}_${iKey}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ICartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const { showToast } = useToast();

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("pj_cart_v3");
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse cart from localStorage", e);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("pj_cart_v3", JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [items, hydrated]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const addToCart = useCallback(
    (
      menuItem: IMenuItem,
      variant?: IVariant,
      addOns: IAddOn[] = [],
      specialInstructions: string = "",
      quantity: number = 1
    ) => {
      const cartItemId = generateCartItemId(menuItem._id, variant, addOns, specialInstructions);

      // Calculate unit price: variant price takes precedence over discountPrice/basePrice
      let unitPrice = variant ? variant.price : menuItem.discountPrice || menuItem.basePrice;
      if (addOns && addOns.length > 0) {
        const addOnsTotal = addOns.reduce((sum, a) => sum + a.price, 0);
        unitPrice += addOnsTotal;
      }

      setItems((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === cartItemId);
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex].quantity += quantity;
          return updated;
        }
        return [
          ...prev,
          {
            id: cartItemId,
            menuItemId: menuItem._id,
            name: menuItem.name,
            hindiName: menuItem.hindiName,
            image: menuItem.image,
            foodType: menuItem.foodType,
            basePrice: menuItem.basePrice,
            unitPrice,
            selectedVariant: variant,
            selectedAddOns: addOns,
            specialInstructions,
            quantity,
          },
        ];
      });

      showToast(`Added ${menuItem.name} to cart ✓`);
    },
    [showToast]
  );

  const updateQuantity = useCallback(
    (id: string, delta: number) => {
      setItems((prev) => {
        return prev
          .map((item) => {
            if (item.id === id) {
              const newQty = item.quantity + delta;
              return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
          })
          .filter(Boolean) as ICartItem[];
      });
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        totalCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
