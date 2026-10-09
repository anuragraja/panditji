import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

export const viewport: Viewport = {
  themeColor: "#102a43",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Pandit Ji Ka Dhaba | घर का स्वाद — Authentic Indian Taste",
  description:
    "Pandit Ji Ka Dhaba — authentic Indian food, fresh ingredients and warm hospitality. Delicious Paneer Butter Masala, Dal Tadka, Tandoori Breads, and combos.",
  keywords: [
    "Pandit Ji Ka Dhaba",
    "Dhaba food",
    "Authentic Indian Food",
    "Ghar ka swad",
    "Online Dhaba Order",
    "Dal Tadka",
    "Paneer Butter Masala",
    "Tandoori Roti",
  ],
  authors: [{ name: "Pandit Ji Ka Dhaba" }],
  openGraph: {
    title: "Pandit Ji Ka Dhaba | घर का स्वाद",
    description: "Authentic Indian Food, Fresh Ingredients & Warm Dhaba Hospitality.",
    url: "https://panditjikadhaba.com",
    siteName: "Pandit Ji Ka Dhaba",
    images: [
      {
        url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Pandit Ji Ka Dhaba Food",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pandit Ji Ka Dhaba | घर का स्वाद",
    description: "Authentic Indian dhaba food delivered fresh to your door.",
    images: ["https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#fffdf9] text-[#172b3a] antialiased selection:bg-[#d99a2b] selection:text-white">
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
