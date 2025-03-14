"use client"

import { useEffect, useState } from "react"
import dynamic from 'next/dynamic'
import type { EarthquakeData } from "@/lib/api"
import { calcularDistanciaHaversine } from "@/utils/seismic-calculations"
import { MapPin, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// Importaciones dinámicas para evitar errores de SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
)

// Importar estilos de Leaflet
import 'leaflet/dist/leaflet.css'

// Correción de iconos de marcadores
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
    iconUrl: icon.src,
    shadowUrl: iconShadow.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

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
  const [center, setCenter] = useState<[number, number]>([-35.6751, -71.543])

  // Crear icono personalizado para terremotos
  const createEarthquakeIcon = (magnitude: number) => {
    const size = Math.max(20, Math.min(50, magnitude * 8))
    let color = "#FCC419" // Yellow for small earthquakes
    if (magnitude >= 6)
      color = "#C92A2A" // Dark red for large
    else if (magnitude >= 5)
      color = "#E03131" // Red
    else if (magnitude >= 4) 
      color = "#F76707" // Orange

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

  // Manejar selección de terremoto
  const handleEarthquakeSelect = (quake: EarthquakeData) => {
    if (onSelectEarthquake) {
      onSelectEarthquake(quake)
      setCenter([quake.latitude, quake.longitude])
    }
  }

  // Calcular línea de distancia
  const calculateDistanceLine = () => {
    if (selectedEarthquake && userLocation) {
      const distance = calcularDistanciaHaversine(
        userLocation.latitude,
        userLocation.longitude,
        selectedEarthquake.latitude,
        selectedEarthquake.longitude,
      )

      return {
        positions: [
          [userLocation.latitude, userLocation.longitude],
          [selectedEarthquake.latitude, selectedEarthquake.longitude]
        ],
        distance: Math.round(distance)
      }
    }
    return null
  }

  return (
    <Card className="relative overflow-hidden">
      <MapContainer 
        center={center} 
        zoom={5} 
        style={{ height: '500px', width: '100%' }}
        className="z-10"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Marcadores de terremotos */}
        {earthquakes.map((quake) => (
          <Marker 
            key={quake.id} 
            position={[quake.latitude, quake.longitude]}
            icon={createEarthquakeIcon(quake.magnitude)}
            eventHandlers={{
              click: () => handleEarthquakeSelect(quake)
            }}
          >
            <Popup>
              <b>Magnitud {quake.magnitude} {quake.scale}</b><br />
              {quake.reference}<br />
              Profundidad: {quake.depth} km<br />
              Fecha: {new Date(quake.local_time).toLocaleString()}
            </Popup>
          </Marker>
        ))}

        {/* Marcador de ubicación de usuario */}
        {userLocation && (
          <Marker 
            position={[userLocation.latitude, userLocation.longitude]}
            icon={L.divIcon({
              html: `<div style="
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background-color: #3B82F6;
                border: 3px solid white;
                box-shadow: 0 0 10px rgba(0,0,0,0.5);
              "></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })}
          >
            <Popup>Su ubicación actual</Popup>
          </Marker>
        )}

        {/* Línea de distancia entre terremoto y usuario */}
        {calculateDistanceLine() && (
          <>
            <Polyline 
              positions={calculateDistanceLine()!.positions} 
              color="#3B82F6" 
              dashArray="5,5"
            />
            <Marker 
              position={[
                (calculateDistanceLine()!.positions[0][0] + calculateDistanceLine()!.positions[1][0]) / 2,
                (calculateDistanceLine()!.positions[0][1] + calculateDistanceLine()!.positions[1][1]) / 2
              ]}
              icon={L.divIcon({
                html: `<div style="
                  background: white;
                  padding: 3px 8px;
                  border-radius: 4px;
                  border: 1px solid #ccc;
                  font-size: 12px;
                ">${calculateDistanceLine()!.distance} km</div>`,
              })}
            />
          </>
        )}
      </MapContainer>

      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
        {userLocation && (
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setCenter([userLocation.latitude, userLocation.longitude])}
            className="bg-white/90 hover:bg-white shadow-md"
          >
            <Navigation className="h-4 w-4" />
          </Button>
        )}

        {selectedEarthquake && (
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setCenter([selectedEarthquake.latitude, selectedEarthquake.longitude])}
            className="bg-white/90 hover:bg-white shadow-md"
          >
            <MapPin className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  )
}