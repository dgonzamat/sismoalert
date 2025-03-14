"use client"

import { useState } from "react"
import { Book, ChevronRight, Info, AlertTriangle, Home, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function EducationalContent() {
  const [activeTab, setActiveTab] = useState("basics")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Book className="h-5 w-5" />
          Centro Educativo
        </CardTitle>
        <CardDescription>Información y recursos sobre sismos y preparación ante emergencias</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full rounded-none px-4">
            <TabsTrigger value="basics">Conceptos</TabsTrigger>
            <TabsTrigger value="preparation">Preparación</TabsTrigger>
            <TabsTrigger value="during">Durante</TabsTrigger>
            <TabsTrigger value="after">Después</TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="p-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full dark:bg-blue-900">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">¿Qué es un sismo?</h3>
                  <p className="text-muted-foreground">
                    Un sismo o terremoto es una sacudida súbita del terreno producida por el paso de ondas sísmicas a
                    través de las rocas de la Tierra. Estas ondas se generan cuando se libera energía acumulada en la
                    corteza terrestre.
                  </p>
                </div>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Tipos de ondas sísmicas</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Ondas P (Primarias)</p>
                          <p className="text-sm text-muted-foreground">
                            Son las más rápidas y las primeras en llegar. Producen compresiones y dilataciones en el
                            terreno.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Ondas S (Secundarias)</p>
                          <p className="text-sm text-muted-foreground">
                            Son más lentas que las P y producen movimientos perpendiculares a la dirección de
                            propagación.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Ondas Superficiales</p>
                          <p className="text-sm text-muted-foreground">
                            Son las más destructivas y se propagan por la superficie terrestre.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Escalas de medición</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Escala de Richter</p>
                          <p className="text-sm text-muted-foreground">
                            Mide la magnitud o energía liberada por un sismo. Es logarítmica, lo que significa que cada
                            punto representa un aumento de 10 veces en la amplitud de las ondas.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Escala de Magnitud de Momento (Mw)</p>
                          <p className="text-sm text-muted-foreground">
                            Es la escala más precisa y utilizada actualmente para medir la magnitud de terremotos
                            grandes.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Escala de Mercalli Modificada</p>
                          <p className="text-sm text-muted-foreground">
                            Mide la intensidad de un sismo según los efectos observados en un lugar específico. Va de I
                            a XII.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>¿Por qué Chile es sísmico?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      Chile es uno de los países más sísmicos del mundo debido a su ubicación en el "Cinturón de Fuego
                      del Pacífico" y a la subducción de la placa de Nazca bajo la placa Sudamericana.
                    </p>
                    <p className="mb-2">
                      Esta zona de subducción genera una enorme acumulación de energía que se libera periódicamente en
                      forma de terremotos.
                    </p>
                    <p>
                      Chile ha experimentado algunos de los terremotos más grandes registrados en la historia,
                      incluyendo el terremoto de Valdivia de 1960 (9.5 Mw), el más potente jamás registrado.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>

          <TabsContent value="preparation" className="p-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-full dark:bg-green-900">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Preparación ante sismos</h3>
                  <p className="text-muted-foreground">
                    La preparación adecuada puede marcar la diferencia en caso de un terremoto. Estas son algunas
                    medidas que puede tomar para estar preparado.
                  </p>
                </div>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Kit de emergencia</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Prepare un kit de emergencia que incluya:</p>
                    <ul className="space-y-1 ml-5 list-disc">
                      <li>Agua (4 litros por persona por día para al menos 3 días)</li>
                      <li>Alimentos no perecederos para 3 días</li>
                      <li>Linterna y pilas de repuesto</li>
                      <li>Radio a pilas o de manivela</li>
                      <li>Botiquín de primeros auxilios</li>
                      <li>Medicamentos recetados</li>
                      <li>Silbato para pedir ayuda</li>
                      <li>Mascarillas antipolvo</li>
                      <li>Toallitas húmedas, bolsas de basura y papel higiénico</li>
                      <li>Herramientas básicas (alicate, llave inglesa)</li>
                      <li>Abrelatas manual</li>
                      <li>Mapas locales</li>
                      <li>Teléfono móvil con cargadores y batería de respaldo</li>
                      <li>Documentos importantes en una bolsa impermeable</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Plan familiar de emergencia</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>Establezca un punto de encuentro familiar fuera de su hogar y otro fuera de su barrio.</p>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>
                          Identifique zonas seguras dentro de cada habitación (bajo mesas resistentes, junto a muros
                          estructurales).
                        </p>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>Practique simulacros de terremoto regularmente con su familia.</p>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>
                          Designe un contacto fuera de la ciudad para que los miembros de la familia puedan comunicarse.
                        </p>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>
                          Enseñe a los niños cómo y cuándo llamar al 131 (Ambulancia), 132 (Bomberos) o 133
                          (Carabineros).
                        </p>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Seguridad en el hogar</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>Asegure a la pared muebles altos, estanterías y electrodomésticos que puedan caerse.</p>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>Instale cerrojos en las puertas de armarios para evitar que se abran durante un sismo.</p>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>Coloque objetos pesados en estantes bajos.</p>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>No cuelgue objetos pesados sobre camas o sofás.</p>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>Identifique y repare grietas estructurales en su vivienda.</p>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>
                          Aprenda a cerrar las llaves de paso de gas, agua y el interruptor general de electricidad.
                        </p>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>

          <TabsContent value="during" className="p-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-red-100 p-2 rounded-full dark:bg-red-900">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Durante un sismo</h3>
                  <p className="text-muted-foreground">
                    Saber cómo actuar durante un terremoto puede salvar vidas. Siga estas recomendaciones según el lugar
                    donde se encuentre.
                  </p>
                </div>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Si está en el interior</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>
                          <strong>Agáchese, cúbrase y agárrese</strong>: Busque refugio bajo una mesa resistente o junto
                          a un muro interior, lejos de ventanas y objetos que puedan caer.
                        </p>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>
                          Si no hay una mesa cerca, cúbrase la cara y la cabeza con los brazos y agáchese en una esquina
                          interior del edificio.
                        </p>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>
                          Permanezca donde está hasta que el temblor haya terminado. La mayoría de las lesiones ocurren
                          cuando las personas intentan moverse o evacuar durante el sismo.
                        </p>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>No use los ascensores.</p>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>
                          Si está en la cama, quédese allí y proteja su cabeza con una almohada, a menos que esté debajo
                          de un objeto pesado que podría caerse.
                        </p>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Si está en el exterior</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>
                          Aléjese de edificios, árboles, postes de luz, cables eléctricos y estructuras que puedan
                          caerse.
                        </p>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>Busque un lugar abierto y despejado, agáchese y cúbrase la cabeza con las manos.</p>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>
                          Si está en una zona costera y siente un sismo fuerte, evacúe inmediatamente a zonas altas ante
                          posible tsunami.
                        </p>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>Manténgase alerta a posibles deslizamientos de tierra si está en una zona montañosa.</p>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Si está conduciendo</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>
                          Reduzca la velocidad gradualmente y deténgase en un lugar seguro, lejos de edificios, árboles,
                          puentes y cables eléctricos.
                        </p>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>Permanezca dentro del vehículo hasta que el temblor haya terminado.</p>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>Evite detenerse en o bajo puentes, pasos a desnivel o túneles.</p>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>Si hay cables eléctricos caídos sobre su vehículo, permanezca dentro y espere ayuda.</p>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>Cuando reanude la marcha, esté atento a daños en las carreteras y puentes.</p>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>

          <TabsContent value="after" className="p-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 p-2 rounded-full dark:bg-amber-900">
                  <Home className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Después de un sismo</h3>
                  <p className="text-muted-foreground">
                    Las acciones que tome después de un terremoto son cruciales para su seguridad y la de su familia.
                    Siga estas recomendaciones.
                  </p>
                </div>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Primeras acciones</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>Verifique si hay heridos y proporcione primeros auxilios si está capacitado.</p>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>Escuche la radio o televisión para obtener información de emergencia.</p>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>
                          Revise su vivienda para detectar daños estructurales. Si hay daños graves o duda de la
                          seguridad, evacúe.
                        </p>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>
                          Verifique si hay fugas de gas, agua o daños eléctricos. Si huele gas, abra las ventanas,
                          cierre la llave principal y salga inmediatamente.
                        </p>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>
                          Limpie inmediatamente derrames de medicamentos, productos químicos u otros materiales
                          peligrosos.
                        </p>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Réplicas</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      Las réplicas son terremotos más pequeños que ocurren después de un sismo principal. Pueden causar
                      daños adicionales y continuar durante días, semanas o incluso meses.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>Esté preparado para réplicas y actúe de la misma manera que durante el sismo principal.</p>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>
                          Las réplicas pueden causar daños adicionales a estructuras ya debilitadas. Evite edificios
                          dañados.
                        </p>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>
                          Si está en un área dañada, observe el suelo, carreteras, líneas de servicios públicos y
                          paredes en busca de grietas y daños.
                        </p>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Comunicación y ayuda</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>
                          Use mensajes de texto en lugar de llamadas para comunicarse, ya que las redes pueden estar
                          saturadas.
                        </p>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>Contacte a su persona de referencia fuera de la ciudad para informar sobre su estado.</p>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>
                          Ayude a vecinos que puedan necesitar asistencia especial, como ancianos, personas con
                          discapacidades o familias con niños pequeños.
                        </p>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>Colabore con las autoridades y siga sus instrucciones.</p>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                        <p>No difunda rumores ni información no verificada.</p>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

