import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Plus, Edit, Trash2, Monitor, Users, Calendar, Wifi } from "lucide-react";

interface Classroom {
  id: string;
  name: string;
  building: string;
  floor: string;
  capacity: number;
  type: "amphitheatre" | "salle_cours" | "laboratoire" | "salle_tp";
  equipment: string[];
  status: "disponible" | "occupe" | "maintenance";
  description: string;
}

export function ClassroomManager() {
  const [classrooms] = useState<Classroom[]>([
    {
      id: "1",
      name: "A101",
      building: "Bâtiment A",
      floor: "1er étage",
      capacity: 50,
      type: "salle_cours",
      equipment: ["Vidéoprojecteur", "WiFi", "Tableau numérique"],
      status: "disponible",
      description: "Salle de cours standard"
    },
    {
      id: "2",
      name: "LAB1",
      building: "Bâtiment B",
      floor: "2ème étage",
      capacity: 30,
      type: "laboratoire",
      equipment: ["30 PC", "Serveur", "WiFi", "Imprimante"],
      status: "occupe",
      description: "Laboratoire informatique"
    },
    {
      id: "3",
      name: "AMPHI1",
      building: "Bâtiment C",
      floor: "Rez-de-chaussée",
      capacity: 200,
      type: "amphitheatre",
      equipment: ["Sonorisation", "Vidéoprojecteur", "Éclairage", "WiFi"],
      status: "disponible",
      description: "Grand amphithéâtre"
    }
  ]);

  const [selectedBuilding, setSelectedBuilding] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const buildings = ["Bâtiment A", "Bâtiment B", "Bâtiment C"];
  const floors = ["Rez-de-chaussée", "1er étage", "2ème étage", "3ème étage"];
  const equipmentOptions = [
    "Vidéoprojecteur", "WiFi", "Tableau numérique", "Sonorisation", 
    "PC", "Imprimante", "Scanner", "Webcam", "Micros"
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "amphitheatre": return "bg-purple-500/20 text-purple-700";
      case "salle_cours": return "bg-blue-500/20 text-blue-700";
      case "laboratoire": return "bg-green-500/20 text-green-700";
      case "salle_tp": return "bg-orange-500/20 text-orange-700";
      default: return "bg-gray-500/20 text-gray-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "disponible": return "bg-green-500/20 text-green-700";
      case "occupe": return "bg-red-500/20 text-red-700";
      case "maintenance": return "bg-yellow-500/20 text-yellow-700";
      default: return "bg-gray-500/20 text-gray-700";
    }
  };

  const filteredClassrooms = classrooms.filter(classroom => {
    return (selectedBuilding === "all" || classroom.building === selectedBuilding) &&
           (selectedType === "all" || classroom.type === selectedType);
  });

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Gestion des Salles et Espaces
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="list">Liste des Salles</TabsTrigger>
              <TabsTrigger value="create">Créer Salle</TabsTrigger>
              <TabsTrigger value="booking">Réservations</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Bâtiment</Label>
                  <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les bâtiments</SelectItem>
                      {buildings.map((building) => (
                        <SelectItem key={building} value={building}>{building}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="amphitheatre">Amphithéâtre</SelectItem>
                      <SelectItem value="salle_cours">Salle de cours</SelectItem>
                      <SelectItem value="laboratoire">Laboratoire</SelectItem>
                      <SelectItem value="salle_tp">Salle TP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle Salle
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                {filteredClassrooms.map((classroom) => (
                  <Card key={classroom.id} className="glass">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{classroom.name}</h3>
                            <Badge className={getTypeColor(classroom.type)}>
                              {classroom.type.replace('_', ' ')}
                            </Badge>
                            <Badge className={getStatusColor(classroom.status)}>
                              {classroom.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span className="text-sm">{classroom.building} - {classroom.floor}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span className="text-sm">{classroom.capacity} places</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Monitor className="w-4 h-4" />
                              <span className="text-sm">{classroom.equipment.length} équipements</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{classroom.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {classroom.equipment.map((eq, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {eq}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Calendar className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="create" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nom de la salle</Label>
                  <Input placeholder="Ex: A101, LAB1, AMPHI1" />
                </div>
                <div>
                  <Label>Bâtiment</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un bâtiment" />
                    </SelectTrigger>
                    <SelectContent>
                      {buildings.map((building) => (
                        <SelectItem key={building} value={building}>{building}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Étage</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un étage" />
                    </SelectTrigger>
                    <SelectContent>
                      {floors.map((floor) => (
                        <SelectItem key={floor} value={floor}>{floor}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Capacité</Label>
                  <Input type="number" placeholder="50" />
                </div>
                <div>
                  <Label>Type de salle</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Type de salle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amphitheatre">Amphithéâtre</SelectItem>
                      <SelectItem value="salle_cours">Salle de cours</SelectItem>
                      <SelectItem value="laboratoire">Laboratoire</SelectItem>
                      <SelectItem value="salle_tp">Salle TP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Statut</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disponible">Disponible</SelectItem>
                      <SelectItem value="occupe">Occupé</SelectItem>
                      <SelectItem value="maintenance">En maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Input placeholder="Description de la salle..." />
                </div>
                <div className="md:col-span-2">
                  <Label>Équipements disponibles</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {equipmentOptions.map((equipment) => (
                      <label key={equipment} className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{equipment}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Créer la salle
              </Button>
            </TabsContent>

            <TabsContent value="booking" className="space-y-4">
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Réservations du jour</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { salle: "A101", matiere: "Mathématiques", horaire: "08:00-10:00", enseignant: "Dr. Dupont" },
                      { salle: "LAB1", matiere: "Programmation", horaire: "10:15-12:15", enseignant: "Prof. Martin" },
                      { salle: "AMPHI1", matiere: "Conférence", horaire: "14:00-16:00", enseignant: "Invité externe" }
                    ].map((booking, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <span className="font-semibold">{booking.salle}</span>
                          <span className="mx-2">-</span>
                          <span>{booking.matiere}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">{booking.horaire}</div>
                          <div className="text-sm">{booking.enseignant}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-4">
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Maintenance et réparations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { salle: "B203", probleme: "Vidéoprojecteur en panne", statut: "En cours", date: "15/03/2024" },
                      { salle: "LAB2", probleme: "3 PC à remplacer", statut: "Planifié", date: "18/03/2024" },
                      { salle: "A105", probleme: "Nettoyage approfondi", statut: "Terminé", date: "12/03/2024" }
                    ].map((maintenance, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <span className="font-semibold">{maintenance.salle}</span>
                          <span className="mx-2">-</span>
                          <span>{maintenance.probleme}</span>
                        </div>
                        <div className="text-right">
                          <Badge className={
                            maintenance.statut === "Terminé" ? "bg-green-500/20 text-green-700" :
                            maintenance.statut === "En cours" ? "bg-yellow-500/20 text-yellow-700" :
                            "bg-blue-500/20 text-blue-700"
                          }>
                            {maintenance.statut}
                          </Badge>
                          <div className="text-sm text-muted-foreground mt-1">{maintenance.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}