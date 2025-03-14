"use client"

import { useState, useEffect } from "react"
import { WifiOff } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)

    // Add event listeners for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      toast({
        title: "Conexión restablecida",
        description: "Ahora estás conectado a Internet",
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast({
        title: "Sin conexión",
        description: "Funcionando en modo offline con datos limitados",
        variant: "destructive",
      })
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-full flex items-center gap-2 shadow-md dark:bg-yellow-900 dark:text-yellow-100">
      <WifiOff className="h-4 w-4" />
      <span className="text-sm font-medium">Modo sin conexión</span>
    </div>
  )
}

