/**
 * Utility functions for estimating local seismic intensity
 * Specialized for Chilean territory with regional adjustments
 */

import { regionToMacroZone } from "./seismic-calculations"

type MacroZone = "norte" | "centro" | "sur" | "austral"
type RegionCode = string // Chilean administrative region codes
type SoilType = "roca" | "suelo_firme" | "suelo_blando" | "relleno" | "arenoso" | "arcilloso" | "aluvial" | "volcánico"

interface RegionalCoefficients {
  a: number
  b: number
  c: number
}

// Regional attenuation coefficients based on CSN studies
const coeficientesRegionales: Record<MacroZone, RegionalCoefficients> = {
  norte: { a: 1.48, b: 0.48, c: 0.0065 },
  centro: { a: 1.52, b: 0.52, c: 0.007 },
  sur: { a: 1.55, b: 0.55, c: 0.0075 },
  austral: { a: 1.5, b: 0.5, c: 0.0068 },
}

// Soil amplification factors
const factoresSuelo: Record<SoilType, number> = {
  roca: 1.0,
  suelo_firme: 1.2,
  suelo_blando: 1.6,
  relleno: 2.0,
  arenoso: 1.8,
  arcilloso: 1.7,
  aluvial: 1.9,
  volcánico: 1.5,
}

/**
 * Estimate local seismic intensity based on earthquake parameters and location
 * @param magnitud Earthquake magnitude
 * @param profundidadKm Earthquake depth in kilometers
 * @param distanciaKm Distance from epicenter in kilometers
 * @param tipoSuelo Soil type at the location
 * @param regionUsuario User's administrative region code
 * @returns Estimated intensity on the Modified Mercalli scale (I-XII)
 */
export function estimarIntensidadLocal(
  magnitud: number,
  profundidadKm: number,
  distanciaKm: number,
  tipoSuelo: SoilType,
  regionUsuario: RegionCode,
): number {
  // Get coefficients for the region
  const macroZona = regionToMacroZone(regionUsuario)
  const { a, b, c } = coeficientesRegionales[macroZona]

  // Base intensity using regional attenuation formula
  let intensidadBase = a * magnitud - b * Math.log10(distanciaKm) - c * distanciaKm

  // Depth adjustment (shallow earthquakes are more destructive)
  const factorProfundidad = profundidadKm < 30 ? 1.2 : profundidadKm < 70 ? 1.0 : 0.8
  intensidadBase = intensidadBase * factorProfundidad

  // Apply soil factor
  intensidadBase = intensidadBase * factoresSuelo[tipoSuelo]

  // Convert to Mercalli scale (I-XII)
  return Math.min(12, Math.max(1, Math.round(intensidadBase)))
}

/**
 * Get description for Mercalli intensity level
 * @param intensidad Mercalli intensity level (1-12)
 * @returns Description of the intensity level
 */
export function getDescripcionIntensidad(intensidad: number): string {
  const descripciones = [
    "No sentido", // 0 (not used)
    "Apenas perceptible para algunas personas en reposo", // I
    "Sentido por personas en reposo, especialmente en pisos altos", // II
    "Perceptible en interiores, objetos colgantes oscilan", // III
    "Sentido por muchos en interiores, vajilla y ventanas vibran", // IV
    "Sentido por casi todos, algunos platos y ventanas se rompen", // V
    "Sentido por todos, muebles se mueven, daños leves", // VI
    "Difícil mantenerse de pie, daños moderados en estructuras", // VII
    "Daños considerables en estructuras, caída de chimeneas", // VIII
    "Daños graves, edificios desplazados de cimientos", // IX
    "Destrucción de muchas estructuras, grandes grietas en el suelo", // X
    "Pocas estructuras quedan en pie, puentes destruidos", // XI
    "Destrucción total, objetos lanzados al aire", // XII
  ]

  // Ensure intensity is within valid range
  const safeIntensidad = Math.min(12, Math.max(1, Math.round(intensidad)))
  return descripciones[safeIntensidad]
}

/**
 * Get recommendations based on intensity level and construction type
 * @param intensidad Mercalli intensity level (1-12)
 * @param tipoConstruccion Type of building construction
 * @returns Array of safety recommendations
 */
export function getRecomendacionesIntensidad(
  intensidad: number,
  tipoConstruccion: "hormigon" | "albanileria" | "madera" | "adobe" = "hormigon",
): string[] {
  // Base recommendations for all construction types
  const recomendacionesBase = [
    // Intensity I-III
    ["No se requieren medidas especiales", "Mantén la calma, es un sismo de baja intensidad"],
    // Intensity IV-V
    [
      "Aléjate de ventanas y objetos que puedan caer",
      "Ubícate bajo una mesa resistente o junto a un muro estructural",
      "Mantén la calma y espera a que termine el movimiento",
    ],
    // Intensity VI-VII
    [
      "Protege tu cabeza y cuello con tus brazos",
      "Ubícate bajo una mesa resistente o junto a un muro estructural",
      "Aléjate de ventanas, espejos y muebles altos",
      "No uses ascensores",
      "Corta suministros de gas y electricidad si es posible",
    ],
    // Intensity VIII+
    [
      "Protege tu cabeza y cuello con tus brazos",
      "Ubícate bajo una mesa resistente o junto a un muro estructural",
      "Aléjate de ventanas, espejos y muebles altos",
      "No uses ascensores",
      "Corta suministros de gas y electricidad si es posible",
      "Prepárate para evacuar después del sismo",
      "Ten cuidado con réplicas",
      "Sigue las instrucciones de las autoridades",
    ],
  ]

  // Additional recommendations based on construction type
  const recomendacionesEspecificas = {
    hormigon: [
      "Las estructuras de hormigón armado suelen ser resistentes a sismos moderados",
      "Aléjate de elementos no estructurales como cielos falsos o luminarias",
    ],
    albanileria: [
      "Aléjate de muros y tabiques que puedan agrietarse",
      "Busca protección bajo marcos de puertas reforzados",
    ],
    madera: [
      "Las estructuras de madera suelen ser flexibles ante sismos",
      "Aléjate de chimeneas o elementos pesados que puedan desprenderse",
    ],
    adobe: [
      "Las construcciones de adobe son muy vulnerables a sismos",
      "Evacúa al exterior si es posible hacerlo de forma segura",
      "Si no puedes evacuar, ubícate en una esquina junto a muros cortos",
    ],
  }

  // Select appropriate recommendations based on intensity
  let recomendaciones: string[]
  if (intensidad <= 3) {
    recomendaciones = recomendacionesBase[0]
  } else if (intensidad <= 5) {
    recomendaciones = recomendacionesBase[1]
  } else if (intensidad <= 7) {
    recomendaciones = recomendacionesBase[2]
  } else {
    recomendaciones = recomendacionesBase[3]
  }

  // Add construction-specific recommendations for higher intensities
  if (intensidad >= 5) {
    recomendaciones = [...recomendaciones, ...recomendacionesEspecificas[tipoConstruccion]]
  }

  return recomendaciones
}

/**
 * Get color for intensity level visualization
 * @param intensidad Mercalli intensity level (1-12)
 * @returns CSS color code
 */
export function getColorIntensidad(intensidad: number): string {
  const colores = [
    "#FFFFFF", // Not used
    "#CCFAFF", // I - Very light blue
    "#99EEFF", // II - Light blue
    "#99CCFF", // III - Blue
    "#99FFCC", // IV - Light green
    "#99FF99", // V - Green
    "#FFFF99", // VI - Yellow
    "#FFCC99", // VII - Light orange
    "#FF9999", // VIII - Orange
    "#FF6666", // IX - Light red
    "#FF3333", // X - Red
    "#CC0000", // XI - Dark red
    "#990000", // XII - Very dark red
  ]

  // Ensure intensity is within valid range
  const safeIntensidad = Math.min(12, Math.max(1, Math.round(intensidad)))
  return colores[safeIntensidad]
}

