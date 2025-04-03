// components/layouts/admin/AdminHeader.tsx
"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth-context";
import { useState } from "react";

export default function AdminHeader() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background sticky top-0 z-10 w-full">
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarTrigger onClick={toggleSidebar} />
        </TooltipTrigger>
        <TooltipContent side="right">
          {isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        </TooltipContent>
      </Tooltip>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{user?.email}</span>
      </div>
    </header>
  );
}
