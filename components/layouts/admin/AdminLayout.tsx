// // components/layouts/admin/AdminLayout.tsx
// "use client";

// import React, { useEffect, useState } from "react";
// import { useAuth } from "@/context/auth-context";
// import { usePathname } from "next/navigation";
// import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
// import AdminSidebar from "@/components/layouts/admin/AdminSidebar";
// import AdminHeader from "@/components/layouts/admin/AdminHeader";

// export default function AdminLayout({ children }: { children: React.ReactNode }) {
//   const { user } = useAuth();
//   const [isMounted, setIsMounted] = useState(false);

//   useEffect(() => {
//     setIsMounted(true);
//   }, []);

//   if (!isMounted || !user) return null;

//   return (
//     <SidebarProvider>
//       <div className="flex min-h-screen w-full">
//         <AdminSidebar />
//         <SidebarInset className="admin-layout">
//           <AdminHeader />
//           <main className="admin-content">
//             <div className="full-width-container">{children}</div>
//           </main>
//         </SidebarInset>
//       </div>
//     </SidebarProvider>
//   );
// }

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
      <div className="flex min-h-screen w-full ">
        {/* Sidebar */}
        <div className="flex-shrink-0">
          <AdminSidebar />
        </div>

        {/* Main content area */}
        <div className="flex-grow overflow-hidden responsive-container">
          <SidebarInset className="h-full overflow-y-auto">
            <AdminHeader />
            <main className="admin-content overflow-x-hidden">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}

// "use client"

// import type React from "react"
// import { useEffect, useState } from "react"
// import { useAuth } from "@/context/auth-context"
// import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
// import AdminSidebar from "@/components/layouts/admin/AdminSidebar"
// import AdminHeader from "@/components/layouts/admin/AdminHeader"

// export default function AdminLayout({ children }: { children: React.ReactNode }) {
//   const { user } = useAuth()
//   const [isMounted, setIsMounted] = useState(false)

//   useEffect(() => {
//     setIsMounted(true)
//   }, [])

//   if (!isMounted || !user) return null

//   return (
//     <SidebarProvider>
//       <div className="flex min-h-screen w-full bg-background responsive-container">
//         <AdminSidebar />
//         <SidebarInset className="flex flex-col w-full">
//           <AdminHeader />
//           <main className="flex-1 overflow-x-hidden responsive-container">
//             <div className="container mx-auto  max-w-full">{children}</div>
//           </main>
//         </SidebarInset>
//       </div>
//     </SidebarProvider>
//   )
// }
