"use client"

import { useState } from "react"
import { Send, MapPin, AlertTriangle, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import type { EarthquakeData } from "@/lib/api"

interface CrowdsourceReportProps {
  earthquake: EarthquakeData
  userLocation?: {
    latitude: number
    longitude: number
    regionCode: string
  } | null
}

export default function CrowdsourceReport({ earthquake, userLocation }: CrowdsourceReportProps) {
  const [feltIntensity, setFeltIntensity] = useState<number>(3)
  const [damageLevel, setDamageLevel] = useState<"none" | "light" | "moderate" | "severe">("none")
  const [comments, setComments] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false)

  // Get intensity description
  const getIntensityDescription = (intensity: number): string => {
    switch (intensity) {
      case 1:
        return "No sentido"
      case 2:
        return "Apenas perceptible"
      case 3:
        return "Débil, notado por personas en reposo"
      case 4:
        return "Moderado, sentido por muchas personas"
      case 5:
        return "Bastante fuerte, despierta a personas dormidas"
      case 6:
        return "Fuerte, objetos se mueven, daños leves"
      case 7:
        return "Muy fuerte, difícil mantenerse de pie"
      case 8:
        return "Severo, daños considerables en estructuras"
      case 9:
        return "Violento, pánico general, daños graves"
      case 10:
        return "Extremo, destrucción generalizada"
      default:
        return "Moderado"
    }
  }

  // Submit report
  const submitReport = async () => {
    if (!userLocation) {
      toast({
        title: "Error",
        description: "Se requiere su ubicación para enviar un reporte",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // In a real app, this would send data to a server
      // For now, we'll simulate a network request
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const reportData = {
        earthquakeId: earthquake.id,
        userLocation: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          regionCode: userLocation.regionCode,
        },
        feltIntensity,
        damageLevel,
        comments,
        timestamp: new Date().toISOString(),
      }

      console.log("Report submitted:", reportData)

      setHasSubmitted(true)
      toast({
        title: "Reporte enviado",
        description: "Gracias por contribuir a mejorar nuestras alertas sísmicas",
      })
    } catch (error) {
      console.error("Error submitting report:", error)
      toast({
        title: "Error",
        description: "No se pudo enviar el reporte. Intente nuevamente más tarde.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Reporte Ciudadano
        </CardTitle>
        <CardDescription>Comparta su experiencia para mejorar nuestras alertas</CardDescription>
      </CardHeader>
      <CardContent>
        {hasSubmitted ? (
          <div className="text-center py-6">
            <ThumbsUp className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-bold mb-2">¡Gracias por su reporte!</h3>
            <p className="text-muted-foreground">
              Su contribución ayuda a mejorar la precisión de nuestras alertas sísmicas y a comprender mejor los efectos
              de los sismos en diferentes zonas del país.
            </p>
            <Button className="mt-4" onClick={() => setHasSubmitted(false)}>
              Enviar otro reporte
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {!userLocation && (
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                <div className="flex gap-2 items-center text-yellow-800 dark:text-yellow-200">
                  <MapPin className="h-5 w-5" />
                  <span className="font-medium">Ubicación no disponible</span>
                </div>
                <p className="text-sm mt-1 text-yellow-700 dark:text-yellow-300">
                  Se requiere su ubicación para enviar un reporte preciso. Por favor, active los servicios de ubicación
                  en su dispositivo.
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Label>¿Qué tan fuerte sintió el sismo? ({feltIntensity}/10)</Label>
              <Slider
                value={[feltIntensity]}
                min={1}
                max={10}
                step={1}
                onValueChange={(value) => setFeltIntensity(value[0])}
              />
              <p className="text-sm text-muted-foreground">{getIntensityDescription(feltIntensity)}</p>
            </div>

            <div className="space-y-3">
              <Label>¿Observó daños en su ubicación?</Label>
              <RadioGroup value={damageLevel} onValueChange={(value) => setDamageLevel(value as any)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="none" />
                  <Label htmlFor="none">Sin daños</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light">Daños leves (grietas pequeñas, objetos caídos)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="moderate" />
                  <Label htmlFor="moderate">Daños moderados (grietas en muros, caída de revestimientos)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="severe" id="severe" />
                  <Label htmlFor="severe">Daños graves (colapso parcial, daños estructurales)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label htmlFor="comments">Comentarios adicionales (opcional)</Label>
              <Textarea
                id="comments"
                placeholder="Describa su experiencia durante el sismo..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>

            <Button className="w-full" onClick={submitReport} disabled={isSubmitting || !userLocation}>
              {isSubmitting ? (
                <>Enviando...</>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar reporte
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

