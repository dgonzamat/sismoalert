/**
 * Utility functions for seismic calculations
 * Specialized for Chilean territory with regional adjustments
 */

export type MacroZone = "norte" | "centro" | "sur" | "austral"
export type RegionCode = string // Chilean administrative region codes

interface RegionalVelocities {
  ondaP: number // P-wave velocity in km/s
  ondaS: number // S-wave velocity in km/s
}

interface ArrivalTimeResult {
  tiempoOndaP: number // P-wave arrival time in seconds
  tiempoOndaS: number // S-wave arrival time in seconds
  diferenciaSegundos: number // Time difference between waves in seconds
  tiempoAlerta: number // Available alert time in seconds
  distanciaKm: number // Distance in kilometers
}

// Regional wave velocities based on terrain type
const velocidadesRegionales: Record<MacroZone, RegionalVelocities> = {
  // Northern regions (more arid and rocky terrain)
  norte: { ondaP: 8.2, ondaS: 4.2 },
  // Central regions (mixed terrain)
  centro: { ondaP: 8.0, ondaS: 4.0 },
  // Southern regions (softer and volcanic terrain)
  sur: { ondaP: 7.8, ondaS: 3.8 },
  // Austral regions (more compact terrain)
  austral: { ondaP: 8.1, ondaS: 4.1 },
}

// Map Chilean administrative regions to macro zones
export const regionToMacroZone = (regionCode: RegionCode): MacroZone => {
  // Northern regions: Arica y Parinacota, Tarapacá, Antofagasta, Atacama
  if (["15", "01", "02", "03"].includes(regionCode)) {
    return "norte"
  }
  // Central regions: Coquimbo, Valparaíso, Metropolitana, O'Higgins, Maule
  else if (["04", "05", "13", "06", "07"].includes(regionCode)) {
    return "centro"
  }
  // Southern regions: Ñuble, Biobío, Araucanía, Los Ríos, Los Lagos
  else if (["16", "08", "09", "14", "10"].includes(regionCode)) {
    return "sur"
  }
  // Austral regions: Aysén, Magallanes
  else if (["11", "12"].includes(regionCode)) {
    return "austral"
  }
  // Default to central if unknown
  return "centro"
}

/**
 * Calculate the Haversine distance between two points on Earth
 * @param lat1 Latitude of point 1 in decimal degrees
 * @param lon1 Longitude of point 1 in decimal degrees
 * @param lat2 Latitude of point 2 in decimal degrees
 * @param lon2 Longitude of point 2 in decimal degrees
 * @returns Distance in kilometers
 */
export function calcularDistanciaHaversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Calculate topographic factor based on terrain between epicenter and user location
 * This is a simplified version - a real implementation would use elevation data
 */
export function calcularFactorTopografico(
  epicentroLat: number,
  epicentroLon: number,
  usuarioLat: number,
  usuarioLon: number,
): number {
  // Simplified implementation
  // In a real app, this would use elevation data from a GIS service
  // and calculate the actual terrain profile between points

  // For now, we'll use a simple approximation based on latitude
  // The Andes mountains run north-south through Chile, affecting east-west wave propagation

  // Check if the path crosses the Andes (simplified)
  const crossesAndes = Math.abs(epicentroLon - usuarioLon) > 0.5

  // Higher factor means longer travel time due to terrain obstacles
  return crossesAndes ? 1.15 : 1.0
}

/**
 * Calculate seismic wave arrival time with regional adjustments
 * @param epicentroLat Epicenter latitude
 * @param epicentroLon Epicenter longitude
 * @param usuarioLat User latitude
 * @param usuarioLon User longitude
 * @param profundidadKm Earthquake depth in kilometers
 * @param regionUsuario User's administrative region code
 * @returns Object with arrival times and alert information
 */
export function calcularTiempoLlegada(
  epicentroLat: number,
  epicentroLon: number,
  usuarioLat: number,
  usuarioLon: number,
  profundidadKm: number,
  regionUsuario: RegionCode,
): ArrivalTimeResult {
  // Determine velocities based on region
  const macroZona = regionToMacroZone(regionUsuario)
  const { ondaP, ondaS } = velocidadesRegionales[macroZona]

  // Calculate distance using Haversine formula (considers Earth's curvature)
  const distanciaKm = calcularDistanciaHaversine(epicentroLat, epicentroLon, usuarioLat, usuarioLon)

  // Adjust for topographic obstacles (mountains, valleys)
  const factorTopografico = calcularFactorTopografico(epicentroLat, epicentroLon, usuarioLat, usuarioLon)

  // Total distance including depth (Pythagorean theorem)
  const distanciaTotal = Math.sqrt(Math.pow(distanciaKm * factorTopografico, 2) + Math.pow(profundidadKm, 2))

  // Time in seconds for each wave type
  const tiempoOndaP = distanciaTotal / ondaP
  const tiempoOndaS = distanciaTotal / ondaS

  return {
    tiempoOndaP,
    tiempoOndaS,
    diferenciaSegundos: tiempoOndaS - tiempoOndaP,
    tiempoAlerta: Math.max(0, tiempoOndaS - 10), // available time for alert (minus 10s processing time)
    distanciaKm,
  }
}

/**
 * Format seconds into a human-readable time string
 */
export function formatearTiempo(segundos: number): string {
  if (segundos < 0) return "0s"
  if (segundos < 60) return `${Math.round(segundos)}s`

  const minutos = Math.floor(segundos / 60)
  const segundosRestantes = Math.round(segundos % 60)

  return `${minutos}m ${segundosRestantes}s`
}

/**
 * Get Chilean region name from region code
 */
export function getRegionName(regionCode: RegionCode): string {
  const regions: Record<string, string> = {
    "15": "Arica y Parinacota",
    "01": "Tarapacá",
    "02": "Antofagasta",
    "03": "Atacama",
    "04": "Coquimbo",
    "05": "Valparaíso",
    "13": "Metropolitana",
    "06": "O'Higgins",
    "07": "Maule",
    "16": "Ñuble",
    "08": "Biobío",
    "09": "Araucanía",
    "14": "Los Ríos",
    "10": "Los Lagos",
    "11": "Aysén",
    "12": "Magallanes",
  }

  return regions[regionCode] || "Región desconocida"
}

