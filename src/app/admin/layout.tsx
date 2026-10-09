"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { GlobalAdminNotifier } from "@/components/shared/GlobalAdminNotifier";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoading && !isLoginPage) {
      if (!user || user.role !== "ADMIN") {
        router.push("/admin/login");
      }
    }
  }, [user, isLoading, isLoginPage, router]);

  // If on admin login page, just render children without sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-[#091d2d] flex items-center justify-center text-white text-xs font-bold">
        Verifying administrator privileges...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f7f3eb]">
      <GlobalAdminNotifier />
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
