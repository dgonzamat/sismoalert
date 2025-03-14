"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Waves, MapPin, ArrowRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { EarthquakeData } from "@/lib/api"
import { calcularDistanciaHaversine } from "@/utils/seismic-calculations"

interface TsunamiWarningProps {
  earthquake: EarthquakeData
  userLocation?: {
    latitude: number
    longitude: number
    regionCode: string
  } | null
}

// Coastal coordinates for Chile (simplified)
const COASTAL_COORDINATES = [
  { name: "Arica", lat: -18.4746, lon: -70.3136 },
  { name: "Iquique", lat: -20.2307, lon: -70.1356 },
  { name: "Antofagasta", lat: -23.6509, lon: -70.4001 },
  { name: "Caldera", lat: -27.0672, lon: -70.8262 },
  { name: "Coquimbo", lat: -29.9649, lon: -71.3394 },
  { name: "Valparaíso", lat: -33.0472, lon: -71.6127 },
  { name: "San Antonio", lat: -33.5928, lon: -71.6068 },
  { name: "Constitución", lat: -35.3335, lon: -72.421 },
  { name: "Talcahuano", lat: -36.7249, lon: -73.1169 },
  { name: "Lebu", lat: -37.6083, lon: -73.6542 },
  { name: "Valdivia", lat: -39.8142, lon: -73.2459 },
  { name: "Puerto Montt", lat: -41.4693, lon: -72.9424 },
  { name: "Ancud", lat: -41.8679, lon: -73.8278 },
  { name: "Chaitén", lat: -42.9192, lon: -72.7086 },
  { name: "Puerto Aysén", lat: -45.4033, lon: -72.699 },
  { name: "Punta Arenas", lat: -53.1638, lon: -70.9171 },
]

export default function TsunamiWarning({ earthquake, userLocation }: TsunamiWarningProps) {
  const [tsunamiRisk, setTsunamiRisk] = useState<"none" | "low" | "moderate" | "high" | "extreme">("none")
  const [estimatedArrivalTime, setEstimatedArrivalTime] = useState<number | null>(null)
  const [nearestCoastalPoint, setNearestCoastalPoint] = useState<string | null>(null)
  const [distanceToCoast, setDistanceToCoast] = useState<number | null>(null)
  const [evacuationRoutes, setEvacuationRoutes] = useState<string[]>([])
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  // Assess tsunami risk based on earthquake parameters
  useEffect(() => {
    if (!earthquake) return

    // Tsunami risk factors:
    // 1. Magnitude (higher = higher risk)
    // 2. Depth (shallower = higher risk)
    // 3. Distance to coast (closer = higher risk)
    // 4. Location (subduction zone = higher risk)

    // Check if earthquake is in a subduction zone (simplified)
    const isSubductionZone = earthquake.longitude < -70.0

    // Calculate risk based on magnitude and depth
    let risk: "none" | "low" | "moderate" | "high" | "extreme" = "none"

    if (earthquake.magnitude >= 8.0) {
      risk = "extreme"
    } else if (earthquake.magnitude >= 7.5) {
      risk = earthquake.depth < 60 ? "high" : "moderate"
    } else if (earthquake.magnitude >= 7.0) {
      risk = earthquake.depth < 50 ? "moderate" : "low"
    } else if (earthquake.magnitude >= 6.5 && earthquake.depth < 30) {
      risk = "low"
    }

    // Adjust risk based on subduction zone
    if (isSubductionZone && risk !== "none") {
      // Increase risk by one level if in subduction zone
      if (risk === "low") risk = "moderate"
      else if (risk === "moderate") risk = "high"
      else if (risk === "high") risk = "extreme"
    }

    setTsunamiRisk(risk)

    // Find nearest coastal point to earthquake
    if (risk !== "none") {
      let nearestPoint = COASTAL_COORDINATES[0]
      let minDistance = calcularDistanciaHaversine(
        earthquake.latitude,
        earthquake.longitude,
        nearestPoint.lat,
        nearestPoint.lon,
      )

      COASTAL_COORDINATES.forEach((point) => {
        const distance = calcularDistanciaHaversine(earthquake.latitude, earthquake.longitude, point.lat, point.lon)

        if (distance < minDistance) {
          minDistance = distance
          nearestPoint = point
        }
      })

      setNearestCoastalPoint(nearestPoint.name)

      // Estimate tsunami arrival time (simplified)
      // Tsunami speed in deep ocean ~800 km/h, slows near coast
      const tsunamiSpeed = 800 // km/h
      const estimatedTime = (minDistance / tsunamiSpeed) * 60 // minutes

      setEstimatedArrivalTime(estimatedTime)
      setTimeRemaining(estimatedTime)

      // Find user's distance to coast if location available
      if (userLocation) {
        let userNearestPoint = COASTAL_COORDINATES[0]
        let userMinDistance = calcularDistanciaHaversine(
          userLocation.latitude,
          userLocation.longitude,
          userNearestPoint.lat,
          userNearestPoint.lon,
        )

        COASTAL_COORDINATES.forEach((point) => {
          const distance = calcularDistanciaHaversine(
            userLocation.latitude,
            userLocation.longitude,
            point.lat,
            point.lon,
          )

          if (distance < userMinDistance) {
            userMinDistance = distance
            userNearestPoint = point
          }
        })

        setDistanceToCoast(userMinDistance)

        // Set evacuation routes (simplified - would come from a database in a real app)
        if (userMinDistance < 10) {
          setEvacuationRoutes([
            "Diríjase inmediatamente a zonas altas, sobre 30 metros sobre el nivel del mar",
            "Siga las rutas de evacuación señalizadas",
            "Aléjese de ríos y esteros que desembocan en el mar",
            "No utilice vehículos para evacuar, salvo que las autoridades lo indiquen",
          ])
        }
      }
    }
  }, [earthquake, userLocation])

  // Countdown timer for tsunami arrival
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || tsunamiRisk === "none") return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [timeRemaining, tsunamiRisk])

  // If no tsunami risk, don't show the component
  if (tsunamiRisk === "none") return null

  // Get color based on risk level
  const getRiskColor = () => {
    switch (tsunamiRisk) {
      case "extreme":
        return "bg-red-600"
      case "high":
        return "bg-red-500"
      case "moderate":
        return "bg-orange-500"
      case "low":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  // Get text based on risk level
  const getRiskText = () => {
    switch (tsunamiRisk) {
      case "extreme":
        return "Riesgo Extremo"
      case "high":
        return "Riesgo Alto"
      case "moderate":
        return "Riesgo Moderado"
      case "low":
        return "Riesgo Bajo"
      default:
        return "Sin Riesgo"
    }
  }

  return (
    <Card className="border-blue-500 border-2 overflow-hidden">
      <div className={`h-2 ${getRiskColor()}`} />
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Waves className="h-5 w-5 text-blue-600" />
          Alerta de Tsunami
        </CardTitle>
        <Badge variant="outline" className={`${getRiskColor().replace("bg-", "text-")} border-current`}>
          {getRiskText()}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Punto costero más cercano al epicentro</p>
            <p className="font-medium">{nearestCoastalPoint}</p>
          </div>
          {estimatedArrivalTime !== null && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Tiempo estimado de llegada</p>
              <p className="font-medium">{Math.floor(estimatedArrivalTime)} minutos</p>
            </div>
          )}
        </div>

        {timeRemaining !== null && timeRemaining > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Tiempo restante:</span>
              <span className="font-bold text-red-600 dark:text-red-400">{Math.floor(timeRemaining)} minutos</span>
            </div>
            <Progress value={(1 - timeRemaining / estimatedArrivalTime!) * 100} className="h-2 mt-1" />
          </div>
        )}

        {userLocation && distanceToCoast !== null && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>
              Su ubicación está a <strong>{Math.round(distanceToCoast)} km</strong> de la costa
            </span>
          </div>
        )}

        {evacuationRoutes.length > 0 && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
            <div className="flex gap-2 items-center text-blue-800 dark:text-blue-200">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Instrucciones de evacuación:</span>
            </div>
            <ul className="text-sm mt-2 space-y-1 text-blue-700 dark:text-blue-300">
              {evacuationRoutes.map((route, index) => (
                <li key={index} className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{route}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30"
          onClick={() => window.open("https://www.onemi.gov.cl/alertas/", "_blank")}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Ver alertas oficiales ONEMI
        </Button>
      </CardContent>
    </Card>
  )
}

