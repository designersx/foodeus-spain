// components/layouts/admin/AdminLayout.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/layouts/admin/AdminSidebar";
import AdminHeader from "@/components/layouts/admin/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !user) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <SidebarInset className="admin-layout">
          <AdminHeader />
          <main className="admin-content">
            <div className="full-width-container">{children}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
