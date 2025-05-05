"use client"

import React, { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Utensils , Eye, EyeOff,} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle,CardDescription} from "@/components/ui/card"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import { API_BASE_URL } from "@/services/apiService"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useLanguage } from "@/context/language-context"
export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [timer, setTimer] = useState(300) // 5 minutes in seconds
  const [error, setError] = useState("")
  const { toast } = useToast()
  const [loading, setLoading] = useState<boolean>(false);
  const {t}=useLanguage()
  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [otpSent, timer])

  const handleSendOtp = async () => {
    setLoading(true); // start loading
    try {
      setError("")
      const res = await axios.post(`${API_BASE_URL}/admin/forgot_password`, { email })
      console.log(res)
      if (res.status===200) {
        setOtpSent(true)
        setTimer(600) // reset timer
        toast({
          title: t('otpSentTitle'),
          description: t('otpSentDescription').replace('{email}',email),
        })
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log(err.response?.data?.message);
        setError(err.response?.data?.message || "Something went wrong");
      } else {
        console.error("Unexpected error:", err);
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false); // stop loading
    }
  }

  const handleVerifyOtp = async () => {
    try {
      console.log(password)
      if (!password || password.trim() === "") {
        setError(t('enterValidPassword'));
        return;
      }
      if (password.length<6) {
        setError(t('passwordMinLength'));
        return;
      }
      setError("")
      const res = await axios.post(`${API_BASE_URL}/admin/reset_password`, { email, otp,newPassword:password })
      if (res.status===200) {
        toast({
          title: t('passwordUpdatedTitle'),
          description: t('passwordUpdatedDescription'),
        })
        // Optionally redirect to reset password page
        router.push("/auth/login")
      } 
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log(err.response?.data?.message);
        setError(err.response?.data?.message || "Something went while Updating Password");
      } else {
        console.error("Unexpected error:", err);
        setError("An unknown error occurred.");
      }
    }
  }

  // Format timer MM:SS
  const formatTime = (t: number) => {
    const minutes = Math.floor(t / 60)
    const seconds = t % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <>    
 
   
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
    
      <Card className="w-full max-w-md">
      <div className="absolute top-10 left-4">
    <Button variant="outline" onClick={() => window.history.back()} className="text-primary">
      &larr; {t('Back')}
    </Button>
  </div>
      <CardHeader className="text-center space-y-2">
      <div className="flex justify-center mb-2">
        <div className="flex items-center gap-2 text-primary">
          <Utensils className="h-6 w-6" />
          <span className="text-xl font-bold">Menudista</span>
        </div>
      </div>

      <CardTitle className="text-2xl">{t('forgotPasswordHeading')}</CardTitle>
      <CardDescription>
       {t('forgotPasswordSubheading')}
      </CardDescription>
    </CardHeader>

        <CardContent className="space-y-4">
          {!otpSent ? (
            <>
              <Label htmlFor="email">{t('emailPlaceholder')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button className="w-full" onClick={handleSendOtp}  disabled={loading}>
              {loading ? t('sending') : t('sendOtp')}
              </Button>
            </>
          ) : (
            <>
      <p className="text-center text-sm text-muted-foreground">
        {t('otpSentTo')} <strong>{email}</strong>
      </p>

      <Label htmlFor="otp">{t('enterOtpLabel')}</Label>
      <Input
        id="otp"
        type="text"
        placeholder={t('enterOtpPlaceholder')}
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        required
      />

      <Label htmlFor="password">{t('newPasswordLabel')}</Label>
      <Input
        id="password"
        type="password"
        placeholder={t('newPasswordPlaceholder')}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={6}
        required
      />

      <div className="text-sm text-center text-muted-foreground">
        {t('timeLeft')} <span className="font-medium">{formatTime(timer)}</span>
      </div>

      <Button className="w-full mt-2" onClick={handleVerifyOtp}>
        {t('verifyAndReset')}
      </Button>

      {timer === 0 && (
        <Button variant="outline" className="w-full mt-2" onClick={handleSendOtp}>
          {t('resendOtp')}
        </Button>
      )}
    </>
          )}
          {error && <p className="text-center text-sm text-danger">{error}</p>}
        </CardContent>
      </Card>
    </div>
    </>
  )
}
