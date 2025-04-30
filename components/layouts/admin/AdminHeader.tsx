// components/layouts/admin/AdminHeader.tsx
"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth-context";
import { useState } from "react";
import { useLanguage } from "@/context/language-context"

export default function AdminHeader() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const { t } = useLanguage();

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background sticky top-0 z-10 w-full">
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarTrigger onClick={toggleSidebar} />
        </TooltipTrigger>
        <TooltipContent side="right">
          {isOpen ? t("CollapseSidebar") : t("ExpandSidebar")}
        </TooltipContent>
      </Tooltip>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{user?.email}</span>
      </div>
    </header>
  );
}

// "use client"

// import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
// import { SidebarTrigger } from "@/components/ui/sidebar"
// import { useAuth } from "@/context/auth-context"
// import { Bell } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Avatar, AvatarFallback } from "@/components/ui/avatar"
// import { TooltipProvider } from "@/components/ui/tooltip"

// export default function AdminHeader() {
//   const { user } = useAuth()

//   // Get initials from email for avatar
//   const getInitials = (email: string) => {
//     return email?.substring(0, 2).toUpperCase() || "U"
//   }

//   return (
//     <header className="flex h-16 items-center border-b bg-background px-4 sticky top-0 z-10 w-full">
//       <div className="flex items-center gap-2">
//         <TooltipProvider>
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <SidebarTrigger className="h-9 w-9" />
//             </TooltipTrigger>
//             <TooltipContent side="right">Toggle Sidebar</TooltipContent>
//           </Tooltip>
//         </TooltipProvider>
//         <div className="hidden md:block font-semibold">Menudista Admin</div>
//       </div>

//       <div className="flex-1" />

//       <div className="flex items-center gap-2">
//         <Button variant="ghost" size="icon" className="hidden sm:flex">
//           <Bell className="h-5 w-5" />
//           <span className="sr-only">Notifications</span>
//         </Button>

//         <div className="flex items-center gap-3">
//           <span className="text-sm font-medium hidden sm:block">{user?.email}</span>
//           <Avatar className="h-8 w-8">
//             <AvatarFallback>{getInitials(user?.email || "")}</AvatarFallback>
//           </Avatar>
//         </div>
//       </div>
//     </header>
//   )
// }
