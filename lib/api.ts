/**
 * API client for the Centro Sismológico Nacional (CSN)
 */

export interface EarthquakeData {
  id: string
  utc_time: string
  local_time: string
  latitude: number
  longitude: number
  depth: number
  magnitude: number
  scale: string
  reference: string
  region?: string
}

interface ApiResponse {
  status: string
  count: number
  data: EarthquakeData[]
}

const API_BASE_URL = "https://api.xor.cl/sismo"

/**
 * Fetch the latest earthquake data from CSN
 */
export async function fetchLatestEarthquake(): Promise<EarthquakeData | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/?latest=true`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data: ApiResponse = await response.json()
    return data.data[0] || null
  } catch (error) {
    console.error("Error fetching latest earthquake:", error)
    return null
  }
}

/**
 * Fetch recent earthquakes with optional filtering
 * @param limit Number of earthquakes to fetch
 * @param region Optional region code to filter by
 */
export async function fetchRecentEarthquakes(limit = 100, region?: string): Promise<EarthquakeData[]> {
  try {
    let url = `${API_BASE_URL}/?limit=${limit}`
    if (region) {
      url += `&region=${region}`
    }

    const response = await fetch(url, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data: ApiResponse = await response.json()
    return data.data || []
  } catch (error) {
    console.error("Error fetching recent earthquakes:", error)
    return []
  }
}

/**
 * Fetch geological data for a specific location
 * This would connect to SERNAGEOMIN API in a real implementation
 */
export async function fetchGeologicalData(
  latitude: number,
  longitude: number,
): Promise<{ soilType: string; riskLevel: string }> {
  // In a real implementation, this would fetch from SERNAGEOMIN API
  // For now, return mock data based on coordinates

  // Simplified soil type determination based on latitude
  // In reality, this would use detailed geological maps
  let soilType = "suelo_firme"
  let riskLevel = "medio"

  // Coastal areas (simplified check)
  if (longitude < -71.5) {
    soilType = "arenoso"
    riskLevel = "alto"
  }
  // Andes mountain range (simplified check)
  else if (longitude > -70.2) {
    soilType = "roca"
    riskLevel = "bajo"
  }
  // Central valley
  else {
    soilType = "arcilloso"
    riskLevel = "medio"
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  return { soilType, riskLevel }
}

