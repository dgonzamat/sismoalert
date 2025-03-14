"use client"

import { useState, useEffect } from "react"
import { fetchLatestEarthquake, fetchRecentEarthquakes, type EarthquakeData } from "@/lib/api"
import { useGeolocation } from "@/hooks/use-geolocation"
import EarthquakeAlert from "@/components/earthquake-alert"
import EarthquakeMap from "@/components/earthquake-map"
import NotificationManager from "@/components/notification-manager"
import UserLocations from "@/components/user-locations"
import EmergencyMode from "@/components/emergency-mode"
import IntensityMap from "@/components/intensity-map"
import HistoricalData from "@/components/historical-data"
import CrowdsourceReport from "@/components/crowdsource-report"
import AdvancedSettings from "@/components/advanced-settings"
import TsunamiWarning from "@/components/tsunami-warning"
import EducationalContent from "@/components/educational-content"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Activity, AlertTriangle, MapPin, Book } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Location {
  id: string
  name: string
  latitude: number
  longitude: number
  type: "home" | "work" | "family" | "other"
  regionCode: string
}

export default function Home() {
  const [latestEarthquake, setLatestEarthquake] = useState<EarthquakeData | null>(null)
  const [recentEarthquakes, setRecentEarthquakes] = useState<EarthquakeData[]>([])
  const [selectedEarthquake, setSelectedEarthquake] = useState<EarthquakeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [minimumMagnitude, setMinimumMagnitude] = useState(4.0)
  const [savedLocations, setSavedLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [emergencyModeActive, setEmergencyModeActive] = useState(false)
  const [constructionType, setConstructionType] = useState<"hormigon" | "albanileria" | "madera" | "adobe">("hormigon")
  const [activeTab, setActiveTab] = useState("map")
  const [showEducation, setShowEducation] = useState(false)

  // Get user's geolocation
  const { latitude, longitude, regionCode, loading: geoLoading, error: geoError } = useGeolocation()

  // Fetch latest earthquake data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch latest earthquake
        const latest = await fetchLatestEarthquake()
        if (latest) {
          setLatestEarthquake(latest)
          setSelectedEarthquake(latest)

          // Activate emergency mode for significant earthquakes
          if (latest.magnitude >= 5.5) {
            setEmergencyModeActive(true)
          }
        }

        // Fetch recent earthquakes
        const recent = await fetchRecentEarthquakes(50)
        setRecentEarthquakes(recent)
      } catch (error) {
        console.error("Error fetching earthquake data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Set up polling interval (every 60 seconds)
    const interval = setInterval(fetchData, 60000)

    return () => clearInterval(interval)
  }, [])

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("sismoalert-settings")
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        if (settings.constructionType) {
          setConstructionType(settings.constructionType as any)
        }
        if (settings.notificationThreshold) {
          setMinimumMagnitude(settings.notificationThreshold)
        }

        // Apply dark mode if enabled
        if (settings.darkMode) {
          document.documentElement.classList.add("dark")
        } else {
          document.documentElement.classList.remove("dark")
        }
      } catch (error) {
        console.error("Error loading settings:", error)
      }
    }

    // Check if user has seen educational content
    const hasSeenEducation = localStorage.getItem("has-seen-education")
    if (!hasSeenEducation) {
      setShowEducation(true)
    }
  }, [])

  // Handle location selection
  const handleLocationSelected = (location: Location) => {
    setSelectedLocation(location)
  }

  // Handle location added
  const handleLocationAdded = (location: Location) => {
    setSavedLocations((prev) => [...prev, location])
  }

  // Handle location removed
  const handleLocationRemoved = (id: string) => {
    setSavedLocations((prev) => prev.filter((loc) => loc.id !== id))
    if (selectedLocation?.id === id) {
      setSelectedLocation(null)
    }
  }

  // Handle settings saved
  const handleSettingsSaved = (settings: any) => {
    if (settings.constructionType) {
      setConstructionType(settings.constructionType as any)
    }
    if (settings.notificationThreshold) {
      setMinimumMagnitude(settings.notificationThreshold)
    }

    // Apply dark mode if enabled
    if (settings.darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  // Handle education dismissed
  const handleEducationDismissed = () => {
    setShowEducation(false)
    localStorage.setItem("has-seen-education", "true")
  }

  // Get user location object
  const getUserLocation = () => {
    if (selectedLocation) {
      return {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        regionCode: selectedLocation.regionCode,
      }
    }

    if (latitude !== null && longitude !== null && regionCode !== null) {
      return {
        latitude,
        longitude,
        regionCode,
      }
    }

    return null
  }

  // Filter earthquakes by minimum magnitude
  const filteredEarthquakes = recentEarthquakes.filter((quake) => quake.magnitude >= minimumMagnitude)

  return (
    <main className="container mx-auto py-6 px-4 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Activity className="h-8 w-8 text-red-600" />
        SismoAlert
        <span className="text-sm font-normal bg-red-100 text-red-800 px-2 py-1 rounded-full dark:bg-red-900 dark:text-red-100">
          Beta
        </span>
      </h1>

      {/* Educational Content Modal */}
      {showEducation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Book className="h-5 w-5" />
                Bienvenido a SismoAlert
              </h2>
              <Button variant="ghost" size="sm" onClick={handleEducationDismissed}>
                Cerrar
              </Button>
            </div>
            <div className="p-4">
              <EducationalContent />
            </div>
          </div>
        </div>
      )}

      {/* Emergency Mode */}
      {emergencyModeActive && selectedEarthquake && getUserLocation() && (
        <EmergencyMode
          earthquake={selectedEarthquake}
          userLocation={getUserLocation()!}
          onClose={() => setEmergencyModeActive(false)}
          constructionType={constructionType}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Alert for latest significant earthquake */}
          {latestEarthquake && latestEarthquake.magnitude >= 4.5 && getUserLocation() && (
            <EarthquakeAlert earthquake={latestEarthquake} userLocation={getUserLocation()!} />
          )}

          {/* Tsunami warning if applicable */}
          {selectedEarthquake && selectedEarthquake.magnitude >= 6.5 && getUserLocation() && (
            <TsunamiWarning earthquake={selectedEarthquake} userLocation={getUserLocation()} />
          )}

          {/* Main content tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="map">Mapa</TabsTrigger>
              <TabsTrigger value="intensity">Intensidad</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
              <TabsTrigger value="report">Reportar</TabsTrigger>
              <TabsTrigger value="learn">Aprender</TabsTrigger>
            </TabsList>

            <TabsContent value="map" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Mapa Sísmico
                  </CardTitle>
                  <CardDescription>Visualización de eventos sísmicos recientes en Chile</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-[500px] w-full" />
                  ) : (
                    <EarthquakeMap
                      earthquakes={filteredEarthquakes}
                      userLocation={latitude !== null && longitude !== null ? { latitude, longitude } : null}
                      selectedEarthquake={selectedEarthquake}
                      onSelectEarthquake={setSelectedEarthquake}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="intensity" className="mt-4">
              {selectedEarthquake ? (
                <IntensityMap earthquake={selectedEarthquake} userLocation={getUserLocation()} />
              ) : (
                <Card>
                  <CardContent className="py-10 text-center">
                    <AlertTriangle className="h-10 w-10 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Seleccione un sismo para ver el mapa de intensidad</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <HistoricalData earthquakes={recentEarthquakes} />
            </TabsContent>

            <TabsContent value="report" className="mt-4">
              {selectedEarthquake ? (
                <CrowdsourceReport earthquake={selectedEarthquake} userLocation={getUserLocation()} />
              ) : (
                <Card>
                  <CardContent className="py-10 text-center">
                    <AlertTriangle className="h-10 w-10 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Seleccione un sismo para enviar un reporte</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="learn" className="mt-4">
              <EducationalContent />
            </TabsContent>
          </Tabs>

          {/* Selected earthquake details */}
          {selectedEarthquake && getUserLocation() && activeTab !== "intensity" && (
            <EarthquakeAlert earthquake={selectedEarthquake} userLocation={getUserLocation()!} />
          )}
        </div>

        <div className="space-y-6">
          <Tabs defaultValue="locations">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="locations">Ubicaciones</TabsTrigger>
              <TabsTrigger value="notifications">Alertas</TabsTrigger>
              <TabsTrigger value="settings">Ajustes</TabsTrigger>
            </TabsList>

            <TabsContent value="locations" className="mt-4">
              <UserLocations
                initialLocations={savedLocations}
                onLocationAdded={handleLocationAdded}
                onLocationRemoved={handleLocationRemoved}
                onLocationSelected={handleLocationSelected}
              />
            </TabsContent>

            <TabsContent value="notifications" className="mt-4">
              <NotificationManager minimumMagnitude={minimumMagnitude} onMinimumMagnitudeChange={setMinimumMagnitude} />
            </TabsContent>

            <TabsContent value="settings" className="mt-4">
              <AdvancedSettings onSave={handleSettingsSaved} />
            </TabsContent>
          </Tabs>

          {/* Recent earthquakes list */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Sismos Recientes
              </CardTitle>
              <CardDescription>Últimos eventos registrados por el CSN</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {filteredEarthquakes.slice(0, 10).map((quake) => (
                    <div
                      key={quake.id}
                      className={`flex items-center justify-between p-3 border rounded-lg hover:bg-muted/20 cursor-pointer ${
                        selectedEarthquake?.id === quake.id ? "border-primary bg-primary/5" : ""
                      }`}
                      onClick={() => setSelectedEarthquake(quake)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`
                          w-10 h-10 rounded-full flex items-center justify-center font-bold
                          ${
                            quake.magnitude >= 6
                              ? "bg-red-600 text-white"
                              : quake.magnitude >= 5
                                ? "bg-red-500 text-white"
                                : quake.magnitude >= 4
                                  ? "bg-orange-500 text-white"
                                  : "bg-yellow-500 text-white"
                          }
                        `}
                        >
                          {quake.magnitude.toFixed(1)}
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{quake.reference}</p>
                          <p className="text-xs text-muted-foreground">{new Date(quake.local_time).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Emergency mode button */}
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => {
              if (selectedEarthquake && getUserLocation()) {
                setEmergencyModeActive(true)
              }
            }}
            disabled={!selectedEarthquake || !getUserLocation()}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Activar Modo Emergencia
          </Button>
        </div>
      </div>
    </main>
  )
}

