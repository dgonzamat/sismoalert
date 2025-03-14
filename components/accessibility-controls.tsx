"use client"

import { useState, useEffect } from "react"
import { Eye, Volume2, Type, Moon, Sun, RotateCcw, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"

export default function AccessibilityControls() {
  const [fontSize, setFontSize] = useState(100)
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [screenReader, setScreenReader] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Load saved preferences on mount
  useEffect(() => {
    if (typeof window === "undefined") return

    // Check if dark mode is already enabled
    if (document.documentElement.classList.contains("dark")) {
      setDarkMode(true)
    }

    // Load saved preferences from localStorage
    const savedPrefs = localStorage.getItem("accessibility-preferences")
    if (savedPrefs) {
      try {
        const prefs = JSON.parse(savedPrefs)
        if (prefs.fontSize) setFontSize(prefs.fontSize)
        if (prefs.highContrast !== undefined) setHighContrast(prefs.highContrast)
        if (prefs.reducedMotion !== undefined) setReducedMotion(prefs.reducedMotion)
        if (prefs.screenReader !== undefined) setScreenReader(prefs.screenReader)

        // Apply saved preferences
        applyFontSize(prefs.fontSize || 100)
        applyHighContrast(prefs.highContrast || false)
        applyReducedMotion(prefs.reducedMotion || false)
      } catch (error) {
        console.error("Error loading accessibility preferences:", error)
      }
    }
  }, [])

  // Apply font size
  const applyFontSize = (size: number) => {
    document.documentElement.style.fontSize = `${size}%`
  }

  // Apply high contrast
  const applyHighContrast = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add("high-contrast")
    } else {
      document.documentElement.classList.remove("high-contrast")
    }
  }

  // Apply reduced motion
  const applyReducedMotion = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add("reduce-motion")
    } else {
      document.documentElement.classList.remove("reduce-motion")
    }
  }

  // Apply dark mode
  const applyDarkMode = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  // Handle font size change
  const handleFontSizeChange = (value: number[]) => {
    const newSize = value[0]
    setFontSize(newSize)
    applyFontSize(newSize)
    savePreferences({ fontSize: newSize })
  }

  // Handle high contrast change
  const handleHighContrastChange = (enabled: boolean) => {
    setHighContrast(enabled)
    applyHighContrast(enabled)
    savePreferences({ highContrast: enabled })
  }

  // Handle reduced motion change
  const handleReducedMotionChange = (enabled: boolean) => {
    setReducedMotion(enabled)
    applyReducedMotion(enabled)
    savePreferences({ reducedMotion: enabled })
  }

  // Handle screen reader change
  const handleScreenReaderChange = (enabled: boolean) => {
    setScreenReader(enabled)
    savePreferences({ screenReader: enabled })

    if (enabled) {
      toast({
        title: "Modo de lectura activado",
        description: "Se han optimizado los elementos para lectores de pantalla",
      })

      // In a real app, this would enable additional ARIA attributes
      // and optimize the UI for screen readers
    }
  }

  // Handle dark mode change
  const handleDarkModeChange = (enabled: boolean) => {
    setDarkMode(enabled)
    applyDarkMode(enabled)
    savePreferences({ darkMode: enabled })
  }

  // Save preferences to localStorage
  const savePreferences = (
    newPrefs: Partial<{
      fontSize: number
      highContrast: boolean
      reducedMotion: boolean
      screenReader: boolean
      darkMode: boolean
    }>,
  ) => {
    if (typeof window === "undefined") return

    try {
      const savedPrefs = localStorage.getItem("accessibility-preferences")
      const prefs = savedPrefs ? JSON.parse(savedPrefs) : {}

      const updatedPrefs = { ...prefs, ...newPrefs }
      localStorage.setItem("accessibility-preferences", JSON.stringify(updatedPrefs))
    } catch (error) {
      console.error("Error saving accessibility preferences:", error)
    }
  }

  // Reset all preferences
  const resetPreferences = () => {
    setFontSize(100)
    setHighContrast(false)
    setReducedMotion(false)
    setScreenReader(false)

    applyFontSize(100)
    applyHighContrast(false)
    applyReducedMotion(false)

    localStorage.removeItem("accessibility-preferences")

    toast({
      title: "Preferencias restablecidas",
      description: "Se han restaurado las configuraciones de accesibilidad predeterminadas",
    })
  }

  return (
    <div className="relative">
      {/* Accessibility button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 rounded-full h-12 w-12 bg-white shadow-md dark:bg-gray-800"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Opciones de accesibilidad"
      >
        <Eye className="h-5 w-5" />
      </Button>

      {/* Accessibility panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-80 bg-white rounded-lg shadow-lg border p-4 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Opciones de accesibilidad</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar panel de accesibilidad"
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Font size */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Tamaño de texto
                </Label>
                <span className="text-sm text-muted-foreground">{fontSize}%</span>
              </div>
              <Slider
                value={[fontSize]}
                min={80}
                max={150}
                step={10}
                onValueChange={handleFontSizeChange}
                aria-label="Ajustar tamaño de texto"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>A</span>
                <span className="text-base">A</span>
              </div>
            </div>

            {/* Dark mode */}
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="flex items-center gap-2 cursor-pointer">
                {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                Modo oscuro
              </Label>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={handleDarkModeChange}
                aria-label="Activar modo oscuro"
              />
            </div>

            {/* High contrast */}
            <div className="flex items-center justify-between">
              <Label htmlFor="high-contrast" className="flex items-center gap-2 cursor-pointer">
                <Eye className="h-4 w-4" />
                Alto contraste
              </Label>
              <Switch
                id="high-contrast"
                checked={highContrast}
                onCheckedChange={handleHighContrastChange}
                aria-label="Activar alto contraste"
              />
            </div>

            {/* Reduced motion */}
            <div className="flex items-center justify-between">
              <Label htmlFor="reduced-motion" className="flex items-center gap-2 cursor-pointer">
                <Volume2 className="h-4 w-4" />
                Reducir movimiento
              </Label>
              <Switch
                id="reduced-motion"
                checked={reducedMotion}
                onCheckedChange={handleReducedMotionChange}
                aria-label="Activar reducción de movimiento"
              />
            </div>

            {/* Screen reader optimization */}
            <div className="flex items-center justify-between">
              <Label htmlFor="screen-reader" className="flex items-center gap-2 cursor-pointer">
                <Volume2 className="h-4 w-4" />
                Optimizar para lector de pantalla
              </Label>
              <Switch
                id="screen-reader"
                checked={screenReader}
                onCheckedChange={handleScreenReaderChange}
                aria-label="Optimizar para lector de pantalla"
              />
            </div>

            {/* Reset button */}
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={resetPreferences}
              aria-label="Restablecer configuración de accesibilidad"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restablecer configuración
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

