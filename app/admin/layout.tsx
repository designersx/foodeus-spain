// "use client"

// import type React from "react"
// import { FC } from "react";
// import { useEffect, useState } from "react"
// import { usePathname } from "next/navigation"
// import { BarChart3, Clipboard, LogOut, MenuIcon as Restaurant, Utensils } from "lucide-react"
// import Link from 'next/link';
// import { useAuth } from "@/context/auth-context"
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarProvider,
//   SidebarRail,
//   SidebarTrigger,
//   SidebarInset,
// } from "@/components/ui/sidebar"
// import {
//   Tooltip,
//   TooltipTrigger,
//   TooltipContent,
// } from "@/components/ui/tooltip";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
//   DialogClose
// } from "@/components/ui/dialog"
// import { ArrowLeft, Edit, MapPin, Plus, Star, Trash2 } from "lucide-react"
// import { Button } from "@/components/ui/button"

// interface SidebarToggleProps {
//   isOpen: boolean;
// }

// export default function AdminLayout({ children }: { children: React.ReactNode }) {
//   const { user, logout } = useAuth()
//   const pathname = usePathname()
//   const [isMounted, setIsMounted] = useState(false)
//   const [isOpen, setIsOpen] = useState<boolean>(true);
//   useEffect(() => {
//     setIsMounted(true)
//   }, [])

//   if (!isMounted) {
//     return null
//   }

//   if (!user) {
//     return null
//   }
//   const toggleSidebar = () => {
//     setIsOpen((prev) => !prev);
//   };

//   const SidebarToggle: FC<SidebarToggleProps> = ({ isOpen }) => {
//     return (
//       <Tooltip>
//         <TooltipTrigger asChild>
//           <button>
//             <SidebarTrigger />
//           </button>
//         </TooltipTrigger>
//         <TooltipContent side="right">
//           {isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
//         </TooltipContent>
//       </Tooltip>
//     );
//   };

//   const handleLogout=()=>{

//   }
  
//   return (
//     <SidebarProvider>
//       <div className="flex min-h-screen w-full">
//         <Sidebar className="z-20">
//           <SidebarHeader>
//             <SidebarMenu>
//               <SidebarMenuItem>
//                 <SidebarMenuButton size="lg" asChild>
//                   <div className="flex items-center gap-2">
//                     <div className="flex aspect-square size-8 items-center justify-center rounded-lg  text-primary-foreground">
//                       {/* <Utensils className="size-4" /> */}
//                       <img alt="Foodeus Logo" loading="lazy" width="32" height="32" decoding="async" data-nimg="1" className="rounded-circle me-2"  src="/Images/faviconMenu.png?height=32&amp;width=32"/>
//                     </div>
//                     <div className="flex flex-col gap-0.5 leading-none">
//                       <span className="font-semibold">Menudista</span>
//                       <span className="text-xs text-muted-foreground">Admin Panel</span>
//                     </div>
//                   </div>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>
//             </SidebarMenu>
//           </SidebarHeader>
//           <SidebarContent>
//             <SidebarMenu >
//               {/*<SidebarMenuItem>
//                 <SidebarMenuButton asChild isActive={pathname === "/admin/dashboard"}>
//                   <a href="/admin/dashboard">
//                     <BarChart3 className="h-4 w-4" />
//                     <span>Dashboard</span>
//                   </a>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>*/}
//               <SidebarMenuItem>
//                 <SidebarMenuButton asChild isActive={pathname === "/admin/restaurants"}>
//                   <Link href="/admin/restaurants" className="nav-link-admin">
//                     <Restaurant className="h-4 w-4" />
//                     <span>Restaurants</span>
//                   </Link>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>
//               {/* <SidebarMenuItem>
//                 <SidebarMenuButton asChild isActive={pathname === "/admin/capture-menu"}>
//                   <a href="/admin/capture-menu">
//                     <Clipboard className="h-4 w-4" />
//                     <span>Capture Menu</span>
//                   </a>
//                 </SidebarMenuButton>
//               </SidebarMenuItem> */}

//                   <SidebarMenuItem>
//                 <SidebarMenuButton asChild isActive={pathname === "/admin/upload-menu"}>
//                   <Link href="/admin/upload-menu" className="nav-link-admin">
//                     <Clipboard className="h-4 w-4" />
//                     <span>Upload Menu</span>
//                   </Link>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>
//                <SidebarMenuItem>
//                 <SidebarMenuButton asChild isActive={pathname === "/admin/upload-restaurant"}>
//                   <Link href="/admin/upload-restaurant" className="nav-link-admin">
//                     <Clipboard className="h-4 w-4" />
//                     <span>Upload Restaurants</span>
//                   </Link>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>
//             </SidebarMenu>
//           </SidebarContent>
//           <SidebarFooter>
//             <SidebarMenu>
//               <SidebarMenuItem>
//                 <SidebarMenuButton onClick={handleLogout}>
//                   {/* <LogOut className="h-4 w-4" /> */}
//                  <Dialog>
//                   <DialogTrigger asChild>
//                     <Button variant="ghost" size="sm">
//                     <LogOut className="h-4 w-4" /> Logout
//                     </Button >
//                   </DialogTrigger>
//                   <DialogContent>
//                     <DialogHeader>
//                       <DialogTitle>Logout !</DialogTitle>
//                       <DialogDescription>
//                         Are you sure you want to Logout? This action cannot be undone.
//                       </DialogDescription>
//                     </DialogHeader>
//                     <DialogFooter>
//                     <DialogClose asChild>
//                       <Button variant="outline">Cancel</Button>
//                     </DialogClose>
//                       <Button variant="destructive" onClick={logout}>
//                       Logout
//                       </Button>
//                     </DialogFooter>
//                   </DialogContent>
//                 </Dialog>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>
//             </SidebarMenu>
//           </SidebarFooter>
//           <SidebarRail />
//         </Sidebar>
//         <SidebarInset className="admin-layout">
//           <header className="flex h-16 items-center gap-4 border-b bg-background  sticky top-0 z-10 w-full">
//               <Tooltip>
//             <TooltipTrigger asChild>
//              <SidebarTrigger onClick={toggleSidebar} />
//             </TooltipTrigger>
//             <TooltipContent side="right">
//               {isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
//             </TooltipContent>
//           </Tooltip>
//             <div className="flex-1" />
//             <div className="flex items-center gap-2">
//               <span className="text-sm font-medium">{user?.email}</span>
//             </div>
//           </header>
//           <main className="admin-content">
//             <div className="full-width-container">{children}</div>
//           </main>
//         </SidebarInset>
//       </div>
//     </SidebarProvider>
//   )
// }


//second v - on hold
// "use client";

// import { useState } from "react";
// import { usePathname } from "next/navigation";
// import { LogOut, Clipboard, Utensils, Menu as MenuIcon } from "lucide-react";
// import Link from "next/link";
// import { useAuth } from "@/context/auth-context";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
//   DialogDescription,
//   DialogClose
// } from "@/components/ui/dialog";

// export default function AdminLayout({ children }: { children: React.ReactNode }) {
//   const { user, logout } = useAuth();
//   const pathname = usePathname();
//   const [isOpen, setIsOpen] = useState<boolean>(true);

//   const toggleSidebar = () => setIsOpen((prev) => !prev);

//   if (!user) return null;

//   return (
//     <div className="flex h-screen w-screen overflow-hidden">
//       {/* Sidebar */}
//       <aside
//         className={`bg-white border-r transition-all duration-300 flex flex-col justify-between ${
//           isOpen ? "w-64" : "w-16"
//         }`}
//       >
//         {/* Header */}
//         <div className="h-16 flex items-center px-4 border-b">
//           <div className="flex items-center gap-2 text-primary">
//             <img src="/Images/faviconMenu.png" alt="Logo" className="w-8 h-8 rounded" />
//             {isOpen && (
//               <div className="flex flex-col">
//                 <span className="font-bold text-base">Menudista</span>
//                 <span className="text-xs text-muted-foreground">Admin Panel</span>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Scrollable Menu */}
//         <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
//           <Link
//             href="/admin/restaurants"
//             className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition ${
//               pathname === "/admin/restaurants" ? "bg-muted font-semibold" : ""
//             }`}
//           >
//             <Utensils className="h-4 w-4" />
//             {isOpen && <span>Restaurants</span>}
//           </Link>

//           <Link
//             href="/admin/upload-menu"
//             className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition ${
//               pathname === "/admin/upload-menu" ? "bg-muted font-semibold" : ""
//             }`}
//           >
//             <Clipboard className="h-4 w-4" />
//             {isOpen && <span>Upload Menu</span>}
//           </Link>

//           <Link
//             href="/admin/upload-restaurant"
//             className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition ${
//               pathname === "/admin/upload-restaurant" ? "bg-muted font-semibold" : ""
//             }`}
//           >
//             <Clipboard className="h-4 w-4" />
//             {isOpen && <span>Upload Restaurants</span>}
//           </Link>
//         </div>

//         {/* Logout Fixed at Bottom */}
//         <div className="px-2 py-3 border-t">
//           <Dialog>
//             <DialogTrigger asChild>
//               <Button variant="ghost" className="w-full justify-start gap-2">
//                 <LogOut className="h-4 w-4" />
//                 {isOpen && <span>Logout</span>}
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Logout</DialogTitle>
//                 <DialogDescription>Are you sure you want to logout?</DialogDescription>
//               </DialogHeader>
//               <DialogFooter>
//                 <DialogClose asChild>
//                   <Button variant="outline">Cancel</Button>
//                 </DialogClose>
//                 <Button variant="destructive" onClick={logout}>
//                   Logout
//                 </Button>
//               </DialogFooter>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </aside>

//       {/* Main Content Area */}
//       <div className="flex flex-col flex-1 w-full">
//         {/* Top Navbar */}
//         <header className="h-16 flex items-center px-4 border-b sticky top-0 bg-white z-10">
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={toggleSidebar}
//             className="mr-2"
//           >
//             <MenuIcon className="h-5 w-5" />
//           </Button>
//           <div className="flex-1" />
//           <div className="text-sm font-medium text-muted-foreground">
//             {user?.email}
//           </div>
//         </header>

//         {/* Page Content */}
//         <main className="flex-1 overflow-y-auto bg-muted p-4">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }

// app/admin/layout.tsx

"use client";

import React from "react";
import AdminLayout from "@/components/layouts/admin/AdminLayout"; // move your AdminLayout there for clarity

export default function AdminRouteLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
