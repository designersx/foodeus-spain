"use client"

import React, { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import { API_BASE_URL } from "@/services/apiService"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [timer, setTimer] = useState(300) // 5 minutes in seconds
  const [error, setError] = useState("")
  const { toast } = useToast()

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
    try {
      setError("")
      const res = await axios.post(`${API_BASE_URL}/auth/send-otp`, { email })
      if (res.data.success) {
        setOtpSent(true)
        setTimer(300) // reset timer
        toast({
          title: "OTP Sent",
          description: `An OTP has been sent to ${email}`,
        })
      }
    } catch (err) {
      setError("Failed to send OTP. Please try again.")
      console.error(err)
    }
  }

  const handleVerifyOtp = async () => {
    try {
      setError("")
      const res = await axios.post(`${API_BASE_URL}/auth/verify-otp`, { email, otp })
      if (res.data.success) {
        toast({
          title: "OTP Verified",
          description: "You can now reset your password.",
        })
        // Optionally redirect to reset password page
        // router.push("/auth/reset-password")
      } else {
        setError("Invalid OTP. Please try again.")
      }
    } catch (err) {
      setError("OTP verification failed.")
      console.error(err)
    }
  }

  // Format timer MM:SS
  const formatTime = (t: number) => {
    const minutes = Math.floor(t / 60)
    const seconds = t % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {!otpSent ? (
            <>
              <Label htmlFor="email">Enter your registered email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button className="w-full" onClick={handleSendOtp}>
                Send OTP
              </Button>
            </>
          ) : (
            <>
              <p className="text-center text-sm text-muted-foreground">
                OTP sent to <strong>{email}</strong>
              </p>
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <div className="text-sm text-center text-muted-foreground">
                Time left: <span className="font-medium">{formatTime(timer)}</span>
              </div>
              <Button className="w-full mt-2" onClick={handleVerifyOtp}>
                Verify OTP
              </Button>
              {timer === 0 && (
                <Button variant="outline" className="w-full mt-2" onClick={handleSendOtp}>
                  Resend OTP
                </Button>
              )}
            </>
          )}
          {error && <p className="text-center text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
