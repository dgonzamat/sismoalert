"use client"

import { useState } from "react"
import { Settings, Home, Building, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"

interface AdvancedSettingsProps {
  onSave?: (settings: {
    constructionType: string
    notificationThreshold: number
    darkMode: boolean
    dataUsage: string
    lowPowerMode: boolean
  }) => void
}

export default function AdvancedSettings({ onSave }: AdvancedSettingsProps) {
  const [constructionType, setConstructionType] = useState<string>("hormigon")
  const [notificationThreshold, setNotificationThreshold] = useState<number>(4.0)
  const [darkMode, setDarkMode] = useState<boolean>(false)
  const [dataUsage, setDataUsage] = useState<string>("balanced")
  const [lowPowerMode, setLowPowerMode] = useState<boolean>(false)

  // Save settings
  const saveSettings = () => {
    const settings = {
      constructionType,
      notificationThreshold,
      darkMode,
      dataUsage,
      lowPowerMode,
    }

    if (onSave) {
      onSave(settings)
    }

    // In a real app, this would save to localStorage or a database
    localStorage.setItem("sismoalert-settings", JSON.stringify(settings))

    toast({
      title: "Configuración guardada",
      description: "Sus preferencias han sido actualizadas",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuración Avanzada
        </CardTitle>
        <CardDescription>Personalice SismoAlert según sus necesidades específicas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Tipo de construcción</Label>
          <p className="text-sm text-muted-foreground">
            Seleccione el tipo de construcción donde pasa la mayor parte del tiempo para recibir recomendaciones
            personalizadas
          </p>
          <RadioGroup value={constructionType} onValueChange={setConstructionType} className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1 border rounded-lg p-3 cursor-pointer hover:bg-muted/20">
              <RadioGroupItem value="hormigon" id="hormigon" className="sr-only" />
              <Label htmlFor="hormigon" className="cursor-pointer flex flex-col items-center gap-2">
                <Building className="h-8 w-8" />
                <span className="font-medium">Hormigón Armado</span>
                <span className="text-xs text-muted-foreground text-center">
                  Edificios de departamentos, oficinas y construcciones modernas
                </span>
              </Label>
            </div>
            <div className="flex flex-col space-y-1 border rounded-lg p-3 cursor-pointer hover:bg-muted/20">
              <RadioGroupItem value="albanileria" id="albanileria" className="sr-only" />
              <Label htmlFor="albanileria" className="cursor-pointer flex flex-col items-center gap-2">
                <Building className="h-8 w-8" />
                <span className="font-medium">Albañilería</span>
                <span className="text-xs text-muted-foreground text-center">
                  Casas de ladrillo o bloques de cemento
                </span>
              </Label>
            </div>
            <div className="flex flex-col space-y-1 border rounded-lg p-3 cursor-pointer hover:bg-muted/20">
              <RadioGroupItem value="madera" id="madera" className="sr-only" />
              <Label htmlFor="madera" className="cursor-pointer flex flex-col items-center gap-2">
                <Home className="h-8 w-8" />
                <span className="font-medium">Madera</span>
                <span className="text-xs text-muted-foreground text-center">
                  Casas de madera o construcciones ligeras
                </span>
              </Label>
            </div>
            <div className="flex flex-col space-y-1 border rounded-lg p-3 cursor-pointer hover:bg-muted/20">
              <RadioGroupItem value="adobe" id="adobe" className="sr-only" />
              <Label htmlFor="adobe" className="cursor-pointer flex flex-col items-center gap-2">
                <Home className="h-8 w-8" />
                <span className="font-medium">Adobe</span>
                <span className="text-xs text-muted-foreground text-center">
                  Construcciones tradicionales de adobe o tierra
                </span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <Label htmlFor="notification-threshold">Umbral de notificación: {notificationThreshold.toFixed(1)}</Label>
          </div>
          <Slider
            id="notification-threshold"
            min={3.0}
            max={7.0}
            step={0.1}
            value={[notificationThreshold]}
            onValueChange={(value) => setNotificationThreshold(value[0])}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>3.0</span>
            <span>4.0</span>
            <span>5.0</span>
            <span>6.0</span>
            <span>7.0</span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Opciones de la aplicación</h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Modo oscuro</Label>
              <p className="text-sm text-muted-foreground">Reduce el brillo de la pantalla y ahorra batería</p>
            </div>
            <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data-usage">Uso de datos</Label>
            <Select value={dataUsage} onValueChange={setDataUsage}>
              <SelectTrigger id="data-usage" className="w-full">
                <SelectValue placeholder="Seleccione una opción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Bajo (ahorra datos móviles)</SelectItem>
                <SelectItem value="balanced">Equilibrado (recomendado)</SelectItem>
                <SelectItem value="high">Alto (mejor experiencia)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="low-power">Modo de bajo consumo</Label>
              <p className="text-sm text-muted-foreground">
                Reduce la frecuencia de actualizaciones para ahorrar batería
              </p>
            </div>
            <Switch id="low-power" checked={lowPowerMode} onCheckedChange={setLowPowerMode} />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={saveSettings}>
          <Save className="h-4 w-4 mr-2" />
          Guardar configuración
        </Button>
      </CardFooter>
    </Card>
  )
}

