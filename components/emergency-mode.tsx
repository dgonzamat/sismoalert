"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, MapPin, Phone, Shield, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { EarthquakeData } from "@/lib/api"
import {
  getRecomendacionesIntensidad,
  estimarIntensidadLocal,
  getDescripcionIntensidad,
} from "@/utils/intensity-calculations"
import { calcularDistanciaHaversine, getRegionName } from "@/utils/seismic-calculations"

interface EmergencyModeProps {
  earthquake: EarthquakeData
  userLocation: {
    latitude: number
    longitude: number
    regionCode: string
  }
  onClose: () => void
  constructionType?: "hormigon" | "albanileria" | "madera" | "adobe"
}

export default function EmergencyMode({
  earthquake,
  userLocation,
  onClose,
  constructionType = "hormigon",
}: EmergencyModeProps) {
  const [intensity, setIntensity] = useState<number>(0)
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [emergencyContacts, setEmergencyContacts] = useState<{ name: string; phone: string }[]>([])

  // Calculate intensity and get recommendations
  useEffect(() => {
    if (!earthquake || !userLocation) return

    // Calculate distance
    const distance = calcularDistanciaHaversine(
      earthquake.latitude,
      earthquake.longitude,
      userLocation.latitude,
      userLocation.longitude,
    )

    // Estimate local intensity
    const estimatedIntensity = estimarIntensidadLocal(
      earthquake.magnitude,
      earthquake.depth,
      distance,
      "suelo_firme", // This would come from geological data in a real app
      userLocation.regionCode,
    )

    setIntensity(estimatedIntensity)

    // Get recommendations based on intensity and construction type
    const recs = getRecomendacionesIntensidad(estimatedIntensity, constructionType)
    setRecommendations(recs)

    // Get emergency contacts based on region
    const regionName = getRegionName(userLocation.regionCode)

    // These would come from a database in a real app
    setEmergencyContacts([
      { name: "Emergencias", phone: "131" },
      { name: "Bomberos", phone: "132" },
      { name: "Carabineros", phone: "133" },
      { name: `ONEMI ${regionName}`, phone: "137" },
    ])

    // Play alert sound
    const audio = new Audio("/alert.mp3")
    audio.play().catch((error) => console.error("Error playing sound:", error))

    // Vibrate device if supported
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 400])
    }
  }, [earthquake, userLocation, constructionType])

  // Handle emergency call
  const callEmergency = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-md mx-auto border-red-500 border-2 bg-white dark:bg-gray-900">
        <div className="bg-red-600 p-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-white animate-pulse" />
            <h2 className="text-xl font-bold text-white">MODO EMERGENCIA</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-red-700">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <CardContent className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-bold">
                Magnitud {earthquake.magnitude} {earthquake.scale}
              </p>
              <p className="text-sm text-muted-foreground">{earthquake.reference}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Profundidad</p>
              <p className="font-medium">{earthquake.depth} km</p>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <div className="flex justify-between items-center mb-2">
              <p className="font-bold text-red-800 dark:text-red-200">Intensidad estimada en su ubicación:</p>
              <p className="font-bold text-lg text-red-800 dark:text-red-200">{intensity} (Mercalli)</p>
            </div>
            <p className="text-sm text-red-700 dark:text-red-300">{getDescripcionIntensidad(intensity)}</p>
          </div>

          <div>
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Instrucciones de seguridad:
            </h3>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="bg-red-100 text-red-800 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 dark:bg-red-900 dark:text-red-100">
                    {index + 1}
                  </span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contactos de emergencia:
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {emergencyContacts.map((contact, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="flex justify-between items-center border-red-200 hover:bg-red-50 hover:text-red-800 dark:border-red-800 dark:hover:bg-red-900/30"
                  onClick={() => callEmergency(contact.phone)}
                >
                  <span>{contact.name}</span>
                  <span className="font-bold">{contact.phone}</span>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Centros de evacuación cercanos:
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Estos son los puntos de encuentro designados en su área:
            </p>
            <div className="space-y-2">
              <div className="p-2 border rounded-lg">
                <p className="font-medium">Plaza de Armas</p>
                <p className="text-sm text-muted-foreground">300m - 4 min caminando</p>
              </div>
              <div className="p-2 border rounded-lg">
                <p className="font-medium">Estadio Municipal</p>
                <p className="text-sm text-muted-foreground">1.2km - 15 min caminando</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

