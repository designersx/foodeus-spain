"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { BarChart3, Clipboard, LogOut, MenuIcon as Restaurant, Utensils } from "lucide-react"

import { useAuth } from "@/context/auth-context"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  if (!user) {
    return null
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="z-20">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                  <div className="flex items-center gap-2">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Utensils className="size-4" />
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-semibold">Foodeus</span>
                      <span className="text-xs text-muted-foreground">Admin Panel</span>
                    </div>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {/*<SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/admin/dashboard"}>
                  <a href="/admin/dashboard">
                    <BarChart3 className="h-4 w-4" />
                    <span>Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>*/}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/admin/restaurants"}>
                  <a href="/admin/restaurants">
                    <Restaurant className="h-4 w-4" />
                    <span>Restaurants</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/admin/capture-menu"}>
                  <a href="/admin/capture-menu">
                    <Clipboard className="h-4 w-4" />
                    <span>Capture Menu</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={logout}>
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="admin-layout">
          <header className="flex h-16 items-center gap-4 border-b bg-background px-6 sticky top-0 z-10 w-full">
            <SidebarTrigger />
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{user?.email}</span>
            </div>
          </header>
          <main className="admin-content">
            <div className="full-width-container">{children}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

