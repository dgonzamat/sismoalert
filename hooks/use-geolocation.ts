"use client"

import { useState, useEffect } from "react"

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  regionCode: string | null
  loading: boolean
  error: string | null
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean
  maximumAge?: number
  timeout?: number
}

// Map coordinates to Chilean administrative regions (simplified)
function getChileanRegion(latitude: number, longitude: number): string | null {
  // This is a simplified version - a real implementation would use proper geofencing
  // with polygon boundaries for each region

  // Regions from north to south with approximate latitude ranges
  const regions = [
    { code: "15", name: "Arica y Parinacota", minLat: -19.5, maxLat: -17.5 },
    { code: "01", name: "Tarapacá", minLat: -21.5, maxLat: -19.5 },
    { code: "02", name: "Antofagasta", minLat: -25.5, maxLat: -21.5 },
    { code: "03", name: "Atacama", minLat: -29.5, maxLat: -25.5 },
    { code: "04", name: "Coquimbo", minLat: -32.5, maxLat: -29.5 },
    { code: "05", name: "Valparaíso", minLat: -33.5, maxLat: -32.5 },
    { code: "13", name: "Metropolitana", minLat: -34.5, maxLat: -33.0 },
    { code: "06", name: "O'Higgins", minLat: -35.5, maxLat: -34.0 },
    { code: "07", name: "Maule", minLat: -36.5, maxLat: -35.0 },
    { code: "16", name: "Ñuble", minLat: -37.2, maxLat: -36.5 },
    { code: "08", name: "Biobío", minLat: -38.5, maxLat: -37.0 },
    { code: "09", name: "Araucanía", minLat: -39.5, maxLat: -38.0 },
    { code: "14", name: "Los Ríos", minLat: -40.5, maxLat: -39.5 },
    { code: "10", name: "Los Lagos", minLat: -44.0, maxLat: -40.5 },
    { code: "11", name: "Aysén", minLat: -49.0, maxLat: -44.0 },
    { code: "12", name: "Magallanes", minLat: -56.0, maxLat: -49.0 },
  ]

  // Find the region that contains the coordinates
  const region = regions.find((r) => latitude >= r.minLat && latitude <= r.maxLat)
  return region?.code || null
}

export function useGeolocation(options: UseGeolocationOptions = {}): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    regionCode: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Geolocalización no soportada en este navegador",
      }))
      return
    }

    const geoOptions = {
      enableHighAccuracy: options.enableHighAccuracy || true,
      maximumAge: options.maximumAge || 30000, // 30 seconds
      timeout: options.timeout || 27000, // 27 seconds
    }

    const successHandler = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords
      const regionCode = getChileanRegion(latitude, longitude)

      setState({
        latitude,
        longitude,
        accuracy,
        regionCode,
        loading: false,
        error: null,
      })
    }

    const errorHandler = (error: GeolocationPositionError) => {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }))
    }

    // Get initial position
    const watchId = navigator.geolocation.watchPosition(successHandler, errorHandler, geoOptions)

    // Cleanup
    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [options.enableHighAccuracy, options.maximumAge, options.timeout])

  return state
}

