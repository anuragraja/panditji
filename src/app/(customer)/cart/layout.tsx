import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Your Cart | Panditji Restaurant",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
