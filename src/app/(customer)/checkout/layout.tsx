import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Checkout | Panditji Restaurant",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
