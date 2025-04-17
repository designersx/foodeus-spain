"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface User {
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()


  useEffect(() => {

    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("foodeus-admin-auth")
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    }
    
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (isLoading) return;
  
    const isAuthRoute = pathname?.startsWith("/auth");
    const isAdminRoute = pathname?.startsWith("/admin");
  
  
    if (!user && isAdminRoute) {
      router.push("/auth/login");
    }
  
    else if (user && isAuthRoute) {
      console.log("User logged in - Redirecting to /admin/restaurants");
      router.push("/admin/restaurants");
    }
  
    // If user is not logged in and not on auth or admin route, allow them to stay on the current route
  }, [user, isLoading, pathname, router]);

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    // console.log("Logging in user:", email)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      const userData = { email, role: "admin" }
      localStorage.setItem("foodeus-admin-auth", JSON.stringify(userData))
      setUser(userData)
      // console.log("Login successful - Redirecting to dashboard")
      router.push("/admin/restaurants")
    } catch (error) {
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // console.log("Logging out user...")
    localStorage.removeItem("foodeus-admin-auth")
    setUser(null)
    router.push("/auth/login")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
