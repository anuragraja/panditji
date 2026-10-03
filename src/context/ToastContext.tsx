"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface ToastContextType {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => setToastMessage(null), 300);
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed right-5 bottom-6 z-50 bg-[#102a43] text-white px-5 py-3 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 border border-[#d99a2b]/30 transition-all duration-300 ease-out ${
            visible ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-95"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#d99a2b] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
