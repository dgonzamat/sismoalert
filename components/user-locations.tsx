"use client"

import { useState } from "react"
import { Home, MapPin, Plus, Trash2, Building, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/hooks/use-toast"

interface Location {
  id: string
  name: string
  latitude: number
  longitude: number
  type: "home" | "work" | "family" | "other"
  regionCode: string
}

interface UserLocationsProps {
  initialLocations?: Location[]
  onLocationAdded?: (location: Location) => void
  onLocationRemoved?: (locationId: string) => void
  onLocationSelected?: (location: Location) => void
}

export default function UserLocations({
  initialLocations = [],
  onLocationAdded,
  onLocationRemoved,
  onLocationSelected,
}: UserLocationsProps) {
  const [locations, setLocations] = useState<Location[]>(initialLocations)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newLocation, setNewLocation] = useState({
    name: "",
    type: "home" as const,
    latitude: "",
    longitude: "",
  })

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocalización no disponible en este navegador",
        variant: "destructive",
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNewLocation((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        }))

        toast({
          title: "Ubicación obtenida",
          description: "Se ha capturado tu ubicación actual",
        })
      },
      (error) => {
        toast({
          title: "Error",
          description: `No se pudo obtener tu ubicación: ${error.message}`,
          variant: "destructive",
        })
      },
    )
  }

  // Add new location
  const addLocation = () => {
    // Validate inputs
    if (!newLocation.name || !newLocation.latitude || !newLocation.longitude) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      })
      return
    }

    // Validate coordinates
    const lat = Number.parseFloat(newLocation.latitude)
    const lon = Number.parseFloat(newLocation.longitude)

    if (isNaN(lat) || isNaN(lon) || lat < -56 || lat > -17 || lon < -76 || lon > -66) {
      toast({
        title: "Error",
        description: "Las coordenadas deben estar dentro del territorio chileno",
        variant: "destructive",
      })
      return
    }

    // Create new location
    const location: Location = {
      id: Date.now().toString(),
      name: newLocation.name,
      latitude: lat,
      longitude: lon,
      type: newLocation.type,
      regionCode: "13", // This would be determined by a proper geofencing function
    }

    // Add to state
    setLocations((prev) => [...prev, location])

    // Call callback
    if (onLocationAdded) {
      onLocationAdded(location)
    }

    // Reset form
    setNewLocation({
      name: "",
      type: "home",
      latitude: "",
      longitude: "",
    })

    setShowAddForm(false)

    toast({
      title: "Ubicación agregada",
      description: `Se ha agregado "${location.name}" a tus ubicaciones`,
    })
  }

  // Remove location
  const removeLocation = (id: string) => {
    setLocations((prev) => prev.filter((loc) => loc.id !== id))

    if (onLocationRemoved) {
      onLocationRemoved(id)
    }

    toast({
      title: "Ubicación eliminada",
      description: "Se ha eliminado la ubicación de tu lista",
    })
  }

  // Select location
  const selectLocation = (location: Location) => {
    if (onLocationSelected) {
      onLocationSelected(location)
    }
  }

  // Get icon for location type
  const getLocationIcon = (type: Location["type"]) => {
    switch (type) {
      case "home":
        return <Home className="h-4 w-4" />
      case "work":
        return <Building className="h-4 w-4" />
      case "family":
        return <Users className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mis Ubicaciones
          </span>
          <Button variant="outline" size="icon" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>Guarda tus ubicaciones frecuentes para recibir alertas personalizadas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
            <div className="space-y-2">
              <Label htmlFor="location-name">Nombre de la ubicación</Label>
              <Input
                id="location-name"
                placeholder="Ej: Mi casa"
                value={newLocation.name}
                onChange={(e) => setNewLocation((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de ubicación</Label>
              <RadioGroup
                value={newLocation.type}
                onValueChange={(value) =>
                  setNewLocation((prev) => ({
                    ...prev,
                    type: value as "home" | "work" | "family" | "other",
                  }))
                }
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="home" id="home" />
                  <Label htmlFor="home" className="flex items-center gap-1">
                    <Home className="h-3 w-3" /> Casa
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="work" id="work" />
                  <Label htmlFor="work" className="flex items-center gap-1">
                    <Building className="h-3 w-3" /> Trabajo
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="family" id="family" />
                  <Label htmlFor="family" className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> Familia
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Otro
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitud</Label>
                <Input
                  id="latitude"
                  placeholder="-33.4489"
                  value={newLocation.latitude}
                  onChange={(e) => setNewLocation((prev) => ({ ...prev, latitude: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitud</Label>
                <Input
                  id="longitude"
                  placeholder="-70.6693"
                  value={newLocation.longitude}
                  onChange={(e) => setNewLocation((prev) => ({ ...prev, longitude: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={getCurrentLocation}>
                Usar ubicación actual
              </Button>
              <Button className="flex-1" onClick={addLocation}>
                Guardar ubicación
              </Button>
            </div>
          </div>
        )}

        {locations.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <MapPin className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p>No tienes ubicaciones guardadas</p>
            <p className="text-sm">Agrega ubicaciones para recibir alertas personalizadas</p>
          </div>
        ) : (
          <div className="space-y-2">
            {locations.map((location) => (
              <div
                key={location.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/20 cursor-pointer"
                onClick={() => selectLocation(location)}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">{getLocationIcon(location.type)}</div>
                  <div>
                    <p className="font-medium">{location.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeLocation(location.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

