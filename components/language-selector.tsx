"use client"

import { useState, useEffect } from "react"
import { Globe, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Available languages
const languages = [
  { code: "es", name: "Español", flag: "🇨🇱" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
  { code: "ay", name: "Aymara", flag: "🇧🇴" },
  { code: "mapudungun", name: "Mapudungun", flag: "🏳️" },
]

interface LanguageSelectorProps {
  onChange?: (languageCode: string) => void
}

export default function LanguageSelector({ onChange }: LanguageSelectorProps) {
  const [currentLanguage, setCurrentLanguage] = useState("es")

  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferred-language")
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage)
    }
  }, [])

  // Handle language change
  const handleLanguageChange = (languageCode: string) => {
    setCurrentLanguage(languageCode)
    localStorage.setItem("preferred-language", languageCode)

    if (onChange) {
      onChange(languageCode)
    }

    // In a real app, this would trigger language change in the application
    // For now, we'll just simulate it with a console log
    console.log(`Language changed to: ${languageCode}`)
  }

  // Get current language object
  const getCurrentLanguage = () => {
    return languages.find((lang) => lang.code === currentLanguage) || languages[0]
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1" aria-label="Seleccionar idioma">
          <Globe className="h-4 w-4 mr-1" />
          <span>{getCurrentLanguage().flag}</span>
          <span className="hidden sm:inline">{getCurrentLanguage().name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <span>{language.flag}</span>
              <span>{language.name}</span>
            </span>
            {currentLanguage === language.code && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

