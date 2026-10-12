import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Reset Password | Panditji Restaurant",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
