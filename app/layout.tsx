import type React from "react"
import { Inter } from "next/font/google"
import { LanguageProvider } from "@/context/language-context"
import Header from "@/components/header"
import Script from "next/script"
import "@/app/globals.css"
import "@/app/custom.css"
import { AuthProvider } from "@/context/auth-context"
import { Toaster  } from "@/components/ui/toaster"


const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Foodeus - Daily Restaurant Menus",
  description: "Find the best menu of the day near you",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
          crossOrigin="anonymous"
        />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <LanguageProvider>
          <Header />
          <AuthProvider>
          <main className="container py-3 mb-5">{children}</main>
          <Toaster />
          </AuthProvider>
        </LanguageProvider>
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}



import './globals.css'