"use client"

import { useState, useEffect } from "react"
import { calcularTiempoLlegada, formatearTiempo } from "@/utils/seismic-calculations"
import { AlertCircle, Clock, MapPin, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface EarthquakeData {
  id: string
  utc_time: string
  local_time: string
  latitude: number
  longitude: number
  depth: number
  magnitude: number
  scale: string
  reference: string
}

interface EarthquakeAlertProps {
  earthquake: EarthquakeData
  userLocation: {
    latitude: number
    longitude: number
    regionCode: string
  }
}

export default function EarthquakeAlert({ earthquake, userLocation }: EarthquakeAlertProps) {
  const [arrivalTimes, setArrivalTimes] = useState<{
    tiempoOndaP: number
    tiempoOndaS: number
    diferenciaSegundos: number
    tiempoAlerta: number
    distanciaKm: number
  } | null>(null)

  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [alertActive, setAlertActive] = useState(false)

  // Calculate arrival times when earthquake data changes
  useEffect(() => {
    if (earthquake && userLocation) {
      const times = calcularTiempoLlegada(
        earthquake.latitude,
        earthquake.longitude,
        userLocation.latitude,
        userLocation.longitude,
        earthquake.depth,
        userLocation.regionCode,
      )

      setArrivalTimes(times)

      // If S-wave hasn't arrived yet, start countdown
      const eventTime = new Date(earthquake.utc_time).getTime()
      const now = new Date().getTime()
      const elapsedSeconds = (now - eventTime) / 1000

      if (elapsedSeconds < times.tiempoOndaS) {
        setTimeRemaining(times.tiempoOndaS - elapsedSeconds)
        setAlertActive(true)
      } else {
        setTimeRemaining(0)
        setAlertActive(false)
      }
    }
  }, [earthquake, userLocation])

  // Countdown timer
  useEffect(() => {
    if (!alertActive || timeRemaining === null) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer)
          setAlertActive(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [alertActive, timeRemaining])

  // Determine alert severity based on magnitude
  const getSeverityColor = (magnitude: number): string => {
    if (magnitude >= 6) return "bg-red-600"
    if (magnitude >= 5) return "bg-red-500"
    if (magnitude >= 4) return "bg-orange-500"
    return "bg-yellow-500"
  }

  if (!arrivalTimes) return null

  return (
    <Card className={`w-full max-w-md mx-auto overflow-hidden ${alertActive ? "border-red-500 border-2" : ""}`}>
      <div className={`h-2 ${getSeverityColor(earthquake.magnitude)}`} />
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Magnitud {earthquake.magnitude} {earthquake.scale}
          </span>
          {alertActive && (
            <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full animate-pulse dark:bg-red-900 dark:text-red-100">
              ¡ALERTA!
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{earthquake.reference}</span>
          </div>
          <div className="text-muted-foreground">Prof: {earthquake.depth} km</div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Distancia:</span>
            <span className="font-medium">{Math.round(arrivalTimes.distanciaKm)} km</span>
          </div>

          {alertActive && timeRemaining !== null ? (
            <>
              <div className="flex justify-between text-sm">
                <span>Tiempo hasta llegada de onda S:</span>
                <span className="font-bold text-red-600 dark:text-red-400">{formatearTiempo(timeRemaining)}</span>
              </div>
              <Progress value={(1 - timeRemaining / arrivalTimes.tiempoOndaS) * 100} className="h-2 mt-1" />
            </>
          ) : (
            <div className="flex justify-between text-sm">
              <span>Tiempo de llegada:</span>
              <span>
                Onda P: {formatearTiempo(arrivalTimes.tiempoOndaP)}, Onda S: {formatearTiempo(arrivalTimes.tiempoOndaS)}
              </span>
            </div>
          )}
        </div>

        {alertActive && (
          <div className="bg-red-50 p-3 rounded-lg border border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <div className="flex gap-2 items-center text-red-800 dark:text-red-200">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Instrucciones de seguridad:</span>
            </div>
            <ul className="text-sm mt-2 space-y-1 text-red-700 dark:text-red-300">
              <li>• Aléjese de ventanas y objetos que puedan caer</li>
              <li>• Ubíquese bajo una mesa resistente</li>
              <li>• Proteja su cabeza y cuello</li>
              <li>• Permanezca en el lugar hasta que termine el movimiento</li>
            </ul>
          </div>
        )}

        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Evento registrado: {new Date(earthquake.local_time).toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}

