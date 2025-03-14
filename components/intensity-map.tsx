"use client"

import { useEffect, useRef, useState } from "react"
import type { EarthquakeData } from "@/lib/api"
import { estimarIntensidadLocal, getColorIntensidad } from "@/utils/intensity-calculations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface IntensityMapProps {
  earthquake: EarthquakeData
  userLocation?: {
    latitude: number
    longitude: number
    regionCode: string
  } | null
}

export default function IntensityMap({ earthquake, userLocation }: IntensityMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [map, setMap] = useState<any>(null)

  // Load Leaflet map
  useEffect(() => {
    if (typeof window === "undefined" || mapLoaded) return

    // Dynamic import of leaflet
    const loadMap = async () => {
      try {
        // Import leaflet dynamically
        const L = (await import("leaflet")).default
        await import("leaflet/dist/leaflet.css")

        // Create map if it doesn't exist
        if (!map && mapRef.current) {
          // Center on earthquake
          const initialMap = L.map(mapRef.current).setView([earthquake.latitude, earthquake.longitude], 8)

          // Add tile layer
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(initialMap)

          setMap(initialMap)
          setMapLoaded(true)
        }
      } catch (error) {
        console.error("Error loading map:", error)
      }
    }

    loadMap()

    return () => {
      if (map) {
        map.remove()
      }
    }
  }, [map, mapLoaded, earthquake])

  // Add intensity circles to map
  useEffect(() => {
    if (!map || !mapLoaded || !earthquake) return

    // Import leaflet dynamically
    const addIntensityCircles = async () => {
      try {
        const L = (await import("leaflet")).default

        // Clear existing layers
        map.eachLayer((layer: any) => {
          if (layer.options && layer.options.pane === "overlayPane") {
            map.removeLayer(layer)
          }
        })

        // Add epicenter marker
        const epicenterIcon = L.divIcon({
          html: `<div style="
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: white;
            border: 3px solid red;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
          "></div>`,
          className: "",
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })

        const epicenterMarker = L.marker([earthquake.latitude, earthquake.longitude], { icon: epicenterIcon }).addTo(
          map,
        )

        epicenterMarker.bindPopup(`
          <b>Epicentro</b><br>
          Magnitud: ${earthquake.magnitude} ${earthquake.scale}<br>
          Profundidad: ${earthquake.depth} km<br>
          ${earthquake.reference}
        `)

        // Add intensity circles
        // These would be calculated more precisely in a real app
        // based on geological data and regional factors
        const intensityRadii = [
          { intensity: 8, radius: 30 },
          { intensity: 7, radius: 60 },
          { intensity: 6, radius: 100 },
          { intensity: 5, radius: 150 },
          { intensity: 4, radius: 220 },
          { intensity: 3, radius: 300 },
        ]

        // Adjust radii based on magnitude and depth
        const magnitudeFactor = earthquake.magnitude / 6.0
        const depthFactor = Math.max(0.5, Math.min(1.5, 100 / earthquake.depth))

        intensityRadii.forEach(({ intensity, radius }) => {
          const adjustedRadius = radius * magnitudeFactor * depthFactor * 1000 // Convert to meters

          const circle = L.circle([earthquake.latitude, earthquake.longitude], {
            radius: adjustedRadius,
            color: getColorIntensidad(intensity),
            fillColor: getColorIntensidad(intensity),
            fillOpacity: 0.3,
            weight: 1,
          }).addTo(map)

          circle.bindTooltip(`Intensidad ${intensity} (Mercalli)`)
        })

        // Add user location if available
        if (userLocation) {
          const userMarker = L.marker([userLocation.latitude, userLocation.longitude], {
            icon: L.divIcon({
              html: `<div style="
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background-color: #3B82F6;
                  border: 3px solid white;
                  box-shadow: 0 0 10px rgba(0,0,0,0.5);
                "></div>`,
              className: "",
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            }),
          }).addTo(map)

          // Calculate distance and estimated intensity
          const distance =
            L.latLng(earthquake.latitude, earthquake.longitude).distanceTo(
              L.latLng(userLocation.latitude, userLocation.longitude),
            ) / 1000 // km

          const estimatedIntensity = estimarIntensidadLocal(
            earthquake.magnitude,
            earthquake.depth,
            distance,
            "suelo_firme", // This would come from geological data in a real app
            userLocation.regionCode,
          )

          userMarker.bindPopup(`
            <b>Su ubicación</b><br>
            Distancia al epicentro: ${Math.round(distance)} km<br>
            Intensidad estimada: ${estimatedIntensity} (Mercalli)
          `)

          // Draw line to epicenter
          const line = L.polyline(
            [
              [userLocation.latitude, userLocation.longitude],
              [earthquake.latitude, earthquake.longitude],
            ],
            { color: "#3B82F6", dashArray: "5, 5", weight: 2 },
          ).addTo(map)
        }

        // Fit map to show all relevant points
        if (userLocation) {
          const bounds = L.latLngBounds(
            [earthquake.latitude, earthquake.longitude],
            [userLocation.latitude, userLocation.longitude],
          )
          map.fitBounds(bounds, { padding: [50, 50] })
        }
      } catch (error) {
        console.error("Error adding intensity circles:", error)
      }
    }

    addIntensityCircles()
  }, [map, mapLoaded, earthquake, userLocation])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapa de Intensidad</CardTitle>
        <CardDescription>
          Estimación de intensidad sísmica para M{earthquake.magnitude} {earthquake.scale} - {earthquake.reference}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!mapLoaded ? <Skeleton className="h-[400px] w-full" /> : <div ref={mapRef} className="h-[400px] w-full" />}
        <div className="mt-4 flex justify-center">
          <div className="grid grid-cols-6 gap-1 text-xs text-center">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((intensity) => (
              <div key={intensity} className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full mb-1" style={{ backgroundColor: getColorIntensidad(intensity) }} />
                <span>{intensity}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2">
          Escala de intensidad Mercalli Modificada (I-XII)
        </p>
      </CardContent>
    </Card>
  )
}

