
"use client"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { LogOut, Clipboard, MenuIcon as Restaurant, Users, Upload } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function AdminSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [isHydrated, setIsHydrated] = useState(false)
  const {t} = useLanguage()

  // Only update after hydration
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) return null // Prevent rendering during SSR

  return (
    <Sidebar className="z-20" >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-2 px-4 py-3 pointer-events-none select-none">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/10">
                  <img
                    alt="Foodeus Logo"
                    src="/Images/faviconMenu.png"
                    className="rounded-full h-6 w-6"
                    width={24}
                    height={24}
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Menudista</span>
                  <span className="text-xs text-muted-foreground">{t('AdminPanel')}</span>
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
              <Link href="/admin/restaurants" style={{ textDecoration: "none" }}>
                <Restaurant className="h-4 w-4" />
                <span>{t('Restaurants')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/admin/upload-menu"}>
              <Link href="/admin/upload-menu">
                <Upload className="h-4 w-4" />
                <span>{t('UploadMenu')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem> */}

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/admin/upload-restaurant"}>
              <Link href="/admin/upload-restaurant" style={{ textDecoration: "none" }}>
                <Clipboard className="h-4 w-4" />
                <span>{t("UploadRestaurants")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/admin/users"}>
              <Link href="/admin/users" style={{ textDecoration: "none" }}>
                <Users className="h-4 w-4" />
                <span>{t('Users')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Dialog>
              <DialogTrigger asChild>
                <SidebarMenuButton>
                  <LogOut className="h-4 w-4" />
                  <span>{t('Logout')}</span>
                </SidebarMenuButton>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('Logout')}</DialogTitle>
                  <DialogDescription>{t('LogoutConfirmMessage')}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">{t('Cancel')}</Button>
                  </DialogClose>
                  <Button variant="destructive" onClick={logout}>
                    {t('Logout')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
