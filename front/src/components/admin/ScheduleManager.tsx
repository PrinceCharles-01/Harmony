import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Plus, Edit, Trash2, Download, Upload } from "lucide-react";
import { ScheduleGenerator } from "./ScheduleGenerator"; // Importer le nouveau composant

interface ScheduleEvent {
  id: string;
  subject: string;
  teacher: string;
  class: string;
  room: string;
  day: string;
  startTime: string;
  endTime: string;
  type: "cours" | "td" | "tp" | "examen";
}

export function ScheduleManager() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("semaine-1");
  
  const mockSchedule: ScheduleEvent[] = [
    {
      id: "1",
      subject: "Mathématiques",
      teacher: "Dr. Dupont",
      class: "L1-INFO",
      room: "A101",
      day: "lundi",
      startTime: "08:00",
      endTime: "10:00",
      type: "cours"
    },
    {
      id: "2",
      subject: "Programmation",
      teacher: "Prof. Martin",
      class: "L1-INFO",
      room: "B205",
      day: "lundi",
      startTime: "10:15",
      endTime: "12:15",
      type: "tp"
    }
  ];

  const classes = ["L1-INFO", "L2-INFO", "L3-INFO", "M1-INFO", "M2-INFO"];
  const rooms = ["A101", "A102", "B205", "C301", "LAB1", "LAB2"];
  const teachers = ["Dr. Dupont", "Prof. Martin", "Dr. Bernard", "Prof. Leroy"];
  const timeSlots = [
    "08:00-10:00", "10:15-12:15", "13:30-15:30", "15:45-17:45"
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "cours": return "bg-blue-500/20 text-blue-700";
      case "td": return "bg-green-500/20 text-green-700";
      case "tp": return "bg-orange-500/20 text-orange-700";
      case "examen": return "bg-red-500/20 text-red-700";
      default: return "bg-gray-500/20 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Ajouter le générateur ici */}
      <ScheduleGenerator />

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Gestion Manuelle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="view">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="view">Visualiser</TabsTrigger>
              <TabsTrigger value="create">Créer</TabsTrigger>
              <TabsTrigger value="import">Importer/Exporter</TabsTrigger>
            </TabsList>

            <TabsContent value="view" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Classe</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une classe" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Semaine</Label>
                  <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semaine-1">Semaine 1</SelectItem>
                      <SelectItem value="semaine-2">Semaine 2</SelectItem>
                      <SelectItem value="semaine-3">Semaine 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button className="w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    Afficher
                  </Button>
                </div>
              </div>

              {selectedClass && (
                <div className="grid grid-cols-7 gap-2 mt-6">
                  <div className="font-semibold text-center p-2">Horaires</div>
                  {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"].map((day) => (
                    <div key={day} className="font-semibold text-center p-2">{day}</div>
                  ))}
                  
                  {timeSlots.map((slot) => (
                    <>
                      <div key={slot} className="text-sm p-2 border rounded text-center">{slot}</div>
                      {Array.from({ length: 7 }, (_, i) => (
                        <div key={`${slot}-${i}`} className="min-h-[80px] border rounded p-2">
                          {mockSchedule
                            .filter(event => event.startTime === slot.split('-')[0])
                            .map((event) => (
                              <div key={event.id} className={`text-xs p-2 rounded mb-1 ${getTypeColor(event.type)}`}>
                                <div className="font-semibold">{event.subject}</div>
                                <div>{event.teacher}</div>
                                <div>{event.room}</div>
                              </div>
                            ))}
                        </div>
                      ))}
                    </>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="create" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Matière</Label>
                  <Input placeholder="Nom de la matière" />
                </div>
                <div>
                  <Label>Enseignant</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un enseignant" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher} value={teacher}>{teacher}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Classe</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une classe" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Salle</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une salle" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem key={room} value={room}>{room}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Jour</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un jour" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lundi">Lundi</SelectItem>
                      <SelectItem value="mardi">Mardi</SelectItem>
                      <SelectItem value="mercredi">Mercredi</SelectItem>
                      <SelectItem value="jeudi">Jeudi</SelectItem>
                      <SelectItem value="vendredi">Vendredi</SelectItem>
                      <SelectItem value="samedi">Samedi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Type de cours</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cours">Cours</SelectItem>
                      <SelectItem value="td">TD</SelectItem>
                      <SelectItem value="tp">TP</SelectItem>
                      <SelectItem value="examen">Examen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Heure de début</Label>
                  <Input type="time" />
                </div>
                <div>
                  <Label>Heure de fin</Label>
                  <Input type="time" />
                </div>
              </div>
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter au planning
              </Button>
            </TabsContent>

            <TabsContent value="import" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Importer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input type="file" accept=".csv,.xlsx" />
                    <Button className="w-full">Importer fichier</Button>
                    <p className="text-sm text-muted-foreground">
                      Formats supportés: CSV, Excel
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Exporter
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une classe" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button className="w-full">Exporter en PDF</Button>
                    <Button variant="outline" className="w-full">Exporter en Excel</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}