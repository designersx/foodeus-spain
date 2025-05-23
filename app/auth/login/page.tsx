"use client"

import type React from "react"
import { useAuth } from "@/context/auth-context";
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Utensils, Eye, EyeOff, } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { login, API_BASE_URL } from "@/services/apiService"
import axios from "axios"
import { encrypt, decrypt } from "@/utils/crypto";
import { useLanguage } from "@/context/language-context";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);
  const {t}=useLanguage()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRemember = localStorage.getItem("rememberMe") === "true";
      setRememberMe(savedRemember);

      if (savedRemember) {
        const savedEmail = localStorage.getItem("rememberMeEmail") || "";
        const savedPasswordEncrypted = localStorage.getItem("rememberMePassword") || "";
        const savedPassword = savedPasswordEncrypted ? decrypt(savedPasswordEncrypted) : "";

        setEmail(savedEmail);
        setPassword(savedPassword);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // console.log("Logging in with email:", email, "and password:", password);
      // Call the login function from the auth service
      const response = await axios.post(`${API_BASE_URL}/admin/login`, { email, password });
      // console.log('llds',response);
      if (response.data.success) {
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('rememberMeEmail', email);
          localStorage.setItem("rememberMePassword", encrypt(password));
        } else {
          localStorage.removeItem("rememberMeEmail");
          localStorage.removeItem("rememberMePassword");
          localStorage.setItem("rememberMe", "false");
        }
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem("foodeus-admin-auth", JSON.stringify({ email, role: "admin" }))
        await login(email, password)
        toast({
          title: t('loginSuccessTitle'),
          description: t('loginSuccessDescription'),
        })
      }

    } catch (error) {
      console.error("Failed to log in:", error)
      if (axios.isAxiosError(error)) {
        // setError(error.response?.data?.message || "Something went wrong!");
      } else {
        setError("Unexpected error occurred");
      }
      toast({
        title: t('loginFailTitle'),
        description: t('loginFailDescription'),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  const handleRememberMe = (e: React.ChangeEvent<HTMLInputElement>) => {
    // console.log(e.target.checked)
    setRememberMe(e.target.checked);
  }
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="flex items-center gap-2 text-primary">
              <Utensils className="h-6 w-6" />
              <span className="text-xl font-bold">Menudista</span>
            </div>
          </div>
          <CardTitle className="text-2xl">{t('adminLoginHeading')}</CardTitle>
          <CardDescription>{t('adminLoginSubheading')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                maxLength={50}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('passwordLabel')}</Label>
                <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline" >
                  {t('forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder={t('passwordPlaceholder')}
                  maxLength={40}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-end">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => handleRememberMe(e)}
                  className="me-2"
                /><Label htmlFor="remember-me">{t('rememberMe')}</Label>
              </div>
            </div>
            <span className="text-danger d-block text-center">{error && error}
            </span>

          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('loggingIn') : t('loginButton')}
            </Button>
            {/* <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div> */}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

