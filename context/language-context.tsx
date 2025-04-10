"use client"

import type React from "react"
import { createContext, useState, useContext,useEffect} from "react"
import { translations } from "@/lib/translations"


type Language = "en" | "es"
type TranslationKey = keyof typeof translations.en

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("es");
  useEffect(() => {
    // Check if there's a stored language in localStorage
    const storedLanguage = localStorage.getItem("language") as Language;

    // If a language is stored in localStorage, use it; otherwise, use the default "es"
    if (storedLanguage) {
      setLanguage(storedLanguage);
    } else {
      setLanguage("es"); // Default language
    }
  }, []);
  const t = (key: TranslationKey) => {
    return translations[language][key] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

