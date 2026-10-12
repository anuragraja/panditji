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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
      ? process.env.NEXT_PUBLIC_APP_URL
      : "https://panditjirestaurant.com"
  ),
  title: {
    default: "Panditji Restaurant | Restaurant in Khajurikala, Bhopal",
    template: "%s | Panditji Restaurant",
  },
  description:
    "Discover Panditji Restaurant in Khajurikala, Bhopal. Explore our menu, view food photos, check opening hours and find directions to visit us.",
  applicationName: "Panditji Restaurant",
  authors: [{ name: "Panditji Restaurant" }],
  creator: "Panditji Restaurant",
  publisher: "Panditji Restaurant",
  keywords: [
    "Panditji Restaurant",
    "Panditji Restaurant Bhopal",
    "Panditji Restaurant Khajurikala",
    "Restaurant in Khajurikala Bhopal",
    "Pandit Ji Ka Dhaba",
    "Best restaurant in Bhopal",
    "Authentic Indian food Bhopal",
    "Vegetarian restaurant Bhopal",
    "Dal Tadka Bhopal",
    "Paneer Butter Masala Bhopal",
    "Dhaba food Bhopal",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Panditji Restaurant | Restaurant in Khajurikala, Bhopal",
    description:
      "Discover Panditji Restaurant in Khajurikala, Bhopal. Explore our menu, view food photos, check opening hours and find directions to visit us.",
    url: "https://panditjirestaurant.com",
    siteName: "Panditji Restaurant",
    images: [
      {
        url: "/images/logo.png",
        width: 800,
        height: 800,
        alt: "Panditji Restaurant Khajurikala Bhopal",
      },
      {
        url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Panditji Restaurant Authentic Food",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Panditji Restaurant | Restaurant in Khajurikala, Bhopal",
    description:
      "Discover Panditji Restaurant in Khajurikala, Bhopal. Explore our menu, view food photos, check opening hours and find directions to visit us.",
    images: ["/images/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon.png",
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
