"use client"

import { useEffect, useState } from "react"
import { Bell, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"

interface NotificationManagerProps {
  minimumMagnitude?: number
  onMinimumMagnitudeChange?: (value: number) => void
}

export default function NotificationManager({
  minimumMagnitude = 4.0,
  onMinimumMagnitudeChange,
}: NotificationManagerProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "default">("default")
  const [magnitude, setMagnitude] = useState(minimumMagnitude)

  // Check notification permission on mount
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return

    setNotificationPermission(Notification.permission)
  }, [])

  // Request notification permission
  const requestPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      toast({
        title: "Error",
        description: "Este navegador no soporta notificaciones",
        variant: "destructive",
      })
      return
    }

    try {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)

      if (permission === "granted") {
        setNotificationsEnabled(true)
        registerServiceWorker()
        toast({
          title: "Notificaciones activadas",
          description: "Recibirás alertas de sismos en tiempo real",
        })
      } else {
        toast({
          title: "Permiso denegado",
          description: "No podrás recibir notificaciones de sismos",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error)
      toast({
        title: "Error",
        description: "No se pudo solicitar permiso para notificaciones",
        variant: "destructive",
      })
    }
  }

  // Register service worker for push notifications
  const registerServiceWorker = async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return

    try {
      const registration = await navigator.serviceWorker.register("/sw.js")
      console.log("Service Worker registered with scope:", registration.scope)

      // In a real app, you would subscribe to push notifications here
      // and send the subscription to your server
    } catch (error) {
      console.error("Service Worker registration failed:", error)
    }
  }

  // Handle magnitude change
  const handleMagnitudeChange = (value: number[]) => {
    const newValue = value[0]
    setMagnitude(newValue)
    if (onMinimumMagnitudeChange) {
      onMinimumMagnitudeChange(newValue)
    }
  }

  // Test notification
  const sendTestNotification = () => {
    if (typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") {
      toast({
        title: "Error",
        description: "No tienes permisos para recibir notificaciones",
        variant: "destructive",
      })
      return
    }

    // Play alert sound if enabled
    if (soundEnabled) {
      const audio = new Audio("/alert.mp3")
      audio.play().catch((error) => console.error("Error playing sound:", error))
    }

    // Send notification
    const notification = new Notification("SismoAlert - Notificación de Prueba", {
      body: `Recibirás alertas para sismos de magnitud ${magnitude.toFixed(1)} o mayor`,
      icon: "/icon-192.png",
      badge: "/badge-96.png",
      vibrate: [200, 100, 200],
      tag: "test-notification",
      renotify: true,
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Configuración de Notificaciones
        </CardTitle>
        <CardDescription>Configura cómo y cuándo quieres recibir alertas sísmicas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications">Notificaciones</Label>
            <p className="text-sm text-muted-foreground">Recibe alertas de sismos en tiempo real</p>
          </div>
          {notificationPermission === "granted" ? (
            <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
          ) : (
            <Button variant="outline" onClick={requestPermission} className="gap-2">
              <Bell className="h-4 w-4" />
              Activar
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="sound">Sonido de Alerta</Label>
            <p className="text-sm text-muted-foreground">Reproduce un sonido cuando hay una alerta</p>
          </div>
          <div className="flex items-center gap-2">
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            ) : (
              <VolumeX className="h-4 w-4 text-muted-foreground" />
            )}
            <Switch id="sound" checked={soundEnabled} onCheckedChange={setSoundEnabled} />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="magnitude">Magnitud Mínima: {magnitude.toFixed(1)}</Label>
            <p className="text-sm text-muted-foreground">Recibe alertas solo para sismos mayores a esta magnitud</p>
          </div>
          <Slider
            id="magnitude"
            min={3.0}
            max={7.0}
            step={0.1}
            value={[magnitude]}
            onValueChange={handleMagnitudeChange}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>3.0</span>
            <span>4.0</span>
            <span>5.0</span>
            <span>6.0</span>
            <span>7.0</span>
          </div>
        </div>

        {notificationsEnabled && (
          <Button variant="outline" onClick={sendTestNotification} className="w-full">
            Enviar notificación de prueba
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

