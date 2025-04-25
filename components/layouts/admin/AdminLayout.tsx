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
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <div className="flex-shrink-0">
          <AdminSidebar />
        </div>

        {/* Main content area */}
        <div className="flex-grow overflow-hidden">
          <SidebarInset className="h-full overflow-y-auto">
            <AdminHeader />
            <main className="admin-content overflow-x-hidden">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}

