// components/layouts/admin/AdminSidebar.tsx
"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, Clipboard, MenuIcon as Restaurant, Camera } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);

  // Only update after hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) return null; // Prevent rendering during SSR

  return (
    <Sidebar className="z-20">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-2 px-4 py-3 pointer-events-none select-none">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <img
                    alt="Foodeus Logo"
                    src="/Images/faviconMenu.png"
                    className="rounded-circle"
                    width={32}
                    height={32}
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Menudista</span>
                  <span className="text-xs text-muted-foreground">Admin Panel</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/admin/restaurants"}>
              <Link href="/admin/restaurants" className="nav-link-admin">
                <Restaurant className="h-4 w-4" />
                <span>Restaurants</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/admin/upload-menu"}>
              <Link href="/admin/upload-menu" className="nav-link-admin">
                <Clipboard className="h-4 w-4" />
                <span>Upload Menu</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/admin/upload-restaurant"}>
              <Link href="/admin/upload-restaurant" className="nav-link-admin">
                <Clipboard className="h-4 w-4" />
                <span>Upload Restaurants</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/admin/update-HeroSection"}>
              <Link href="/admin/update-HeroSection" className="nav-link-admin">
                <Camera className="h-4 w-4" />
                <span>Manage Hero Section</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/admin/users"}>
              <Link href="/admin/users" className="nav-link-admin">
                <Clipboard className="h-4 w-4" />
                <span>Users</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Logout</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to logout? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button variant="destructive" onClick={logout}>
                      Logout
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
