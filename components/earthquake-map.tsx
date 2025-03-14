"use client"

import { useEffect, useRef, useState } from "react"
import type { EarthquakeData } from "@/lib/api"
import { calcularDistanciaHaversine } from "@/utils/seismic-calculations"
import { MapPin, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface EarthquakeMapProps {
  earthquakes: EarthquakeData[]
  userLocation?: {
    latitude: number
    longitude: number
  } | null
  onSelectEarthquake?: (earthquake: EarthquakeData) => void
  selectedEarthquake?: EarthquakeData | null
}

export default function EarthquakeMap({
  earthquakes,
  userLocation,
  onSelectEarthquake,
  selectedEarthquake,
}: EarthquakeMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])

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
          // Center on Chile
          const initialMap = L.map(mapRef.current).setView([-35.6751, -71.543], 5)

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
  }, [map, mapLoaded])

  // Add earthquake markers to map
  useEffect(() => {
    if (!map || !mapLoaded || earthquakes.length === 0) return

    // Import leaflet dynamically
    const addMarkers = async () => {
      try {
        const L = (await import("leaflet")).default

        // Clear existing markers
        markers.forEach((marker) => marker.remove())
        const newMarkers: any[] = []

        // Create custom icon for earthquakes
        const createEarthquakeIcon = (magnitude: number) => {
          // Size based on magnitude
          const size = Math.max(20, Math.min(50, magnitude * 8))

          // Color based on magnitude
          let color = "#FCC419" // Yellow for small earthquakes
          if (magnitude >= 6)
            color = "#C92A2A" // Dark red for large
          else if (magnitude >= 5)
            color = "#E03131" // Red
          else if (magnitude >= 4) color = "#F76707" // Orange

          return L.divIcon({
            html: `<div style="
              width: ${size}px;
              height: ${size}px;
              border-radius: 50%;
              background-color: ${color};
              opacity: 0.7;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: ${size / 3}px;
              border: 2px solid white;
              box-shadow: 0 0 10px rgba(0,0,0,0.5);
            ">${magnitude.toFixed(1)}</div>`,
            className: "",
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          })
        }

        // Add markers for each earthquake
        earthquakes.forEach((quake) => {
          const marker = L.marker([quake.latitude, quake.longitude], {
            icon: createEarthquakeIcon(quake.magnitude),
          }).addTo(map)

          // Add popup with info
          marker.bindPopup(`
            <b>Magnitud ${quake.magnitude} ${quake.scale}</b><br>
            ${quake.reference}<br>
            Profundidad: ${quake.depth} km<br>
            Fecha: ${new Date(quake.local_time).toLocaleString()}
          `)

          // Add click handler
          marker.on("click", () => {
            if (onSelectEarthquake) {
              onSelectEarthquake(quake)
            }
          })

          // Highlight selected earthquake
          if (selectedEarthquake && selectedEarthquake.id === quake.id) {
            marker.openPopup()
          }

          newMarkers.push(marker)
        })

        // Add user location marker if available
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

          userMarker.bindPopup("Su ubicación actual")
          newMarkers.push(userMarker)

          // If a specific earthquake is selected, draw a line to user
          if (selectedEarthquake) {
            const line = L.polyline(
              [
                [userLocation.latitude, userLocation.longitude],
                [selectedEarthquake.latitude, selectedEarthquake.longitude],
              ],
              { color: "#3B82F6", dashArray: "5, 5", weight: 2 },
            ).addTo(map)

            // Add distance label
            const distance = calcularDistanciaHaversine(
              userLocation.latitude,
              userLocation.longitude,
              selectedEarthquake.latitude,
              selectedEarthquake.longitude,
            )

            const midpoint = [
              (userLocation.latitude + selectedEarthquake.latitude) / 2,
              (userLocation.longitude + selectedEarthquake.longitude) / 2,
            ]

            const distanceMarker = L.marker(midpoint as [number, number], {
              icon: L.divIcon({
                html: `<div style="
                  background: white;
                  padding: 3px 8px;
                  border-radius: 4px;
                  border: 1px solid #ccc;
                  font-size: 12px;
                ">${Math.round(distance)} km</div>`,
                className: "",
              }),
            }).addTo(map)

            newMarkers.push(line, distanceMarker)
          }
        }

        setMarkers(newMarkers)
      } catch (error) {
        console.error("Error adding markers:", error)
      }
    }

    addMarkers()
  }, [map, mapLoaded, earthquakes, userLocation, selectedEarthquake, onSelectEarthquake, markers])

  // Center map on user location
  const centerOnUser = () => {
    if (!map || !userLocation) return
    map.setView([userLocation.latitude, userLocation.longitude], 10)
  }

  // Center map on selected earthquake
  const centerOnEarthquake = () => {
    if (!map || !selectedEarthquake) return
    map.setView([selectedEarthquake.latitude, selectedEarthquake.longitude], 10)
  }

  return (
    <Card className="relative overflow-hidden">
      <div ref={mapRef} className="h-[500px] w-full z-10" />

      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
        {userLocation && (
          <Button
            variant="secondary"
            size="icon"
            onClick={centerOnUser}
            className="bg-white/90 hover:bg-white shadow-md"
          >
            <Navigation className="h-4 w-4" />
          </Button>
        )}

        {selectedEarthquake && (
          <Button
            variant="secondary"
            size="icon"
            onClick={centerOnEarthquake}
            className="bg-white/90 hover:bg-white shadow-md"
          >
            <MapPin className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  )
}

