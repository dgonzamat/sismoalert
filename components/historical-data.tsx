"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { EarthquakeData } from "@/lib/api"
import { getRegionName } from "@/utils/seismic-calculations"

interface HistoricalDataProps {
  earthquakes: EarthquakeData[]
}

interface RegionStats {
  regionCode: string
  regionName: string
  count: number
  avgMagnitude: number
  maxMagnitude: number
}

interface TimeSeriesData {
  date: string
  count: number
  avgMagnitude: number
}

export default function HistoricalData({ earthquakes }: HistoricalDataProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d")
  const [regionStats, setRegionStats] = useState<RegionStats[]>([])
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([])

  // Process earthquake data for statistics
  useEffect(() => {
    if (!earthquakes || earthquakes.length === 0) return

    // Calculate region statistics
    const regionMap = new Map<string, { count: number; sumMag: number; maxMag: number }>()

    earthquakes.forEach((quake) => {
      // Determine region based on coordinates (simplified)
      // In a real app, this would use proper geofencing
      let regionCode = "13" // Default to Metropolitan Region

      // Very simplified region assignment based on latitude
      if (quake.latitude < -41)
        regionCode = "10" // Los Lagos or further south
      else if (quake.latitude < -37)
        regionCode = "08" // Biobío
      else if (quake.latitude < -33)
        regionCode = "07" // Maule
      else if (quake.latitude < -30)
        regionCode = "05" // Valparaíso
      else if (quake.latitude < -27)
        regionCode = "04" // Coquimbo
      else if (quake.latitude < -24)
        regionCode = "03" // Atacama
      else if (quake.latitude < -21)
        regionCode = "02" // Antofagasta
      else if (quake.latitude < -18)
        regionCode = "01" // Tarapacá
      else if (quake.latitude < -17) regionCode = "15" // Arica y Parinacota

      // Update region statistics
      if (!regionMap.has(regionCode)) {
        regionMap.set(regionCode, { count: 0, sumMag: 0, maxMag: 0 })
      }

      const stats = regionMap.get(regionCode)!
      stats.count += 1
      stats.sumMag += quake.magnitude
      stats.maxMag = Math.max(stats.maxMag, quake.magnitude)
    })

    // Convert map to array and sort by count
    const statsArray: RegionStats[] = Array.from(regionMap.entries()).map(([regionCode, stats]) => ({
      regionCode,
      regionName: getRegionName(regionCode),
      count: stats.count,
      avgMagnitude: stats.sumMag / stats.count,
      maxMagnitude: stats.maxMag,
    }))

    // Sort by count (descending)
    statsArray.sort((a, b) => b.count - a.count)

    setRegionStats(statsArray)

    // Calculate time series data
    const now = new Date()
    const timeSeriesMap = new Map<string, { count: number; sumMag: number }>()

    // Determine date range based on selected time range
    let startDate: Date
    switch (timeRange) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      case "30d":
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
    }

    // Group earthquakes by date
    earthquakes.forEach((quake) => {
      const quakeDate = new Date(quake.utc_time)

      // Skip if outside selected time range
      if (quakeDate < startDate) return

      // Format date key based on time range
      let dateKey: string
      if (timeRange === "7d") {
        // For 7 days, group by day
        dateKey = quakeDate.toISOString().split("T")[0]
      } else if (timeRange === "30d") {
        // For 30 days, group by 3-day periods
        const dayOfMonth = Math.floor(quakeDate.getDate() / 3) * 3
        const periodDate = new Date(quakeDate)
        periodDate.setDate(dayOfMonth + 1)
        dateKey = periodDate.toISOString().split("T")[0]
      } else if (timeRange === "90d") {
        // For 90 days, group by week
        const weekNumber = Math.floor((quakeDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
        dateKey = `Week ${weekNumber + 1}`
      } else {
        // For 1 year, group by month
        dateKey = `${quakeDate.getFullYear()}-${(quakeDate.getMonth() + 1).toString().padStart(2, "0")}`
      }

      // Update time series data
      if (!timeSeriesMap.has(dateKey)) {
        timeSeriesMap.set(dateKey, { count: 0, sumMag: 0 })
      }

      const stats = timeSeriesMap.get(dateKey)!
      stats.count += 1
      stats.sumMag += quake.magnitude
    })

    // Convert map to array and sort by date
    const timeSeriesArray: TimeSeriesData[] = Array.from(timeSeriesMap.entries()).map(([date, stats]) => ({
      date,
      count: stats.count,
      avgMagnitude: stats.sumMag / stats.count,
    }))

    // Sort by date
    timeSeriesArray.sort((a, b) => a.date.localeCompare(b.date))

    setTimeSeriesData(timeSeriesArray)
  }, [earthquakes, timeRange])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos Históricos de Sismos</CardTitle>
        <CardDescription>Análisis estadístico de actividad sísmica en Chile</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="regions">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="regions">Por Región</TabsTrigger>
              <TabsTrigger value="timeline">Línea de Tiempo</TabsTrigger>
            </TabsList>

            <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 días</SelectItem>
                <SelectItem value="30d">Últimos 30 días</SelectItem>
                <SelectItem value="90d">Últimos 90 días</SelectItem>
                <SelectItem value="1y">Último año</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="regions" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionStats} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="regionName" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Cantidad de sismos" />
                <Bar yAxisId="right" dataKey="avgMagnitude" fill="#82ca9d" name="Magnitud promedio" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="timeline" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="count" stroke="#8884d8" name="Cantidad de sismos" />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgMagnitude"
                  stroke="#82ca9d"
                  name="Magnitud promedio"
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

