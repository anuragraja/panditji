import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "My Account | Panditji Restaurant",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
