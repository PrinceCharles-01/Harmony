import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { ClipboardCheck, Plus, Calendar as CalendarIcon, Clock, MapPin, Users, FileText, Download } from "lucide-react";

interface Exam {
  id: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  supervisor: string;
  class: string;
  type: "partiel" | "final" | "rattrapage" | "controle";
  duration: number;
  students: number;
}

export function ExamPlanner() {
  const [exams] = useState<Exam[]>([
    {
      id: "1",
      subject: "Mathématiques",
      date: "2024-03-20",
      startTime: "08:00",
      endTime: "10:00",
      room: "AMPHI1",
      supervisor: "Dr. Dupont",
      class: "L1-INFO",
      type: "partiel",
      duration: 120,
      students: 45
    },
    {
      id: "2",
      subject: "Programmation",
      date: "2024-03-22",
      startTime: "14:00",
      endTime: "16:00",
      room: "LAB1",
      supervisor: "Prof. Martin",
      class: "L2-INFO",
      type: "final",
      duration: 120,
      students: 38
    }
  ]);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState("all");

  const subjects = ["Mathématiques", "Programmation", "Base de Données", "Réseaux", "Algorithmique"];
  const rooms = ["AMPHI1", "AMPHI2", "A101", "A102", "LAB1", "LAB2"];
  const supervisors = ["Dr. Dupont", "Prof. Martin", "Dr. Bernard", "Prof. Leroy"];
  const classes = ["L1-INFO", "L2-INFO", "L3-INFO", "M1-INFO", "M2-INFO"];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "partiel": return "bg-blue-500/20 text-blue-700";
      case "final": return "bg-red-500/20 text-red-700";
      case "rattrapage": return "bg-yellow-500/20 text-yellow-700";
      case "controle": return "bg-green-500/20 text-green-700";
      default: return "bg-gray-500/20 text-gray-700";
    }
  };

  const filteredExams = exams.filter(exam => {
    if (selectedPeriod === "all") return true;
    const examDate = new Date(exam.date);
    const now = new Date();
    
    switch (selectedPeriod) {
      case "week":
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return examDate >= now && examDate <= weekFromNow;
      case "month":
        const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        return examDate >= now && examDate <= monthFromNow;
      default:
        return true;
    }
  });

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5" />
            Planification des Examens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="calendar">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="calendar">Calendrier</TabsTrigger>
              <TabsTrigger value="list">Liste</TabsTrigger>
              <TabsTrigger value="create">Planifier</TabsTrigger>
              <TabsTrigger value="reports">Rapports</TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border glass"
                  />
                </div>
                <div className="lg:col-span-2">
                  <Card className="glass">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Examens du {selectedDate?.toLocaleDateString('fr-FR')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {exams
                          .filter(exam => exam.date === selectedDate?.toISOString().split('T')[0])
                          .map((exam) => (
                            <div key={exam.id} className="p-3 border rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold">{exam.subject}</span>
                                    <Badge className={getTypeColor(exam.type)}>
                                      {exam.type}
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {exam.startTime} - {exam.endTime}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {exam.room}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Users className="w-3 h-3" />
                                      {exam.students} étudiants
                                    </div>
                                    <div>{exam.supervisor}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        {exams.filter(exam => exam.date === selectedDate?.toISOString().split('T')[0]).length === 0 && (
                          <p className="text-muted-foreground text-center py-4">
                            Aucun examen prévu pour cette date
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="list" className="space-y-4">
              <div className="flex gap-4">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les examens</SelectItem>
                    <SelectItem value="week">Cette semaine</SelectItem>
                    <SelectItem value="month">Ce mois</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Exporter planning
                </Button>
              </div>

              <div className="grid gap-4">
                {filteredExams.map((exam) => (
                  <Card key={exam.id} className="glass">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{exam.subject}</h3>
                            <Badge className={getTypeColor(exam.type)}>
                              {exam.type}
                            </Badge>
                            <Badge variant="outline">{exam.class}</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="w-4 h-4" />
                              <span>{new Date(exam.date).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{exam.startTime} - {exam.endTime}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{exam.room}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{exam.students} étudiants</span>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">
                            Surveillant: {exam.supervisor}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Modifier</Button>
                          <Button size="sm" variant="outline">PV</Button>
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
                  <Label>Matière</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une matière" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Type d'examen</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="partiel">Partiel</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                      <SelectItem value="rattrapage">Rattrapage</SelectItem>
                      <SelectItem value="controle">Contrôle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>Durée (minutes)</Label>
                  <Input type="number" placeholder="120" />
                </div>
                <div>
                  <Label>Heure de début</Label>
                  <Input type="time" />
                </div>
                <div>
                  <Label>Heure de fin</Label>
                  <Input type="time" />
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
                  <Label>Surveillant</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un surveillant" />
                    </SelectTrigger>
                    <SelectContent>
                      {supervisors.map((supervisor) => (
                        <SelectItem key={supervisor} value={supervisor}>{supervisor}</SelectItem>
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
                  <Label>Nombre d'étudiants</Label>
                  <Input type="number" placeholder="45" />
                </div>
              </div>
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Planifier l'examen
              </Button>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Statistiques de la session</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total examens planifiés</span>
                        <span className="font-semibold">24</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Examens cette semaine</span>
                        <span className="font-semibold">8</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Étudiants concernés</span>
                        <span className="font-semibold">342</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Surveillants mobilisés</span>
                        <span className="font-semibold">12</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Actions rapides</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Générer convocations
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Planning surveillants
                    </Button>
                    <Button className="w-full" variant="outline">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Calendrier session
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Users className="w-4 h-4 mr-2" />
                      Liste des salles
                    </Button>
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