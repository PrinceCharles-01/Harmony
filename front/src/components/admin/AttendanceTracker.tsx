import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { UserCheck, Search, Calendar, TrendingDown, AlertTriangle, Download } from "lucide-react";

interface AttendanceRecord {
  id: string;
  studentName: string;
  studentId: string;
  class: string;
  subject: string;
  date: string;
  status: "present" | "absent" | "retard" | "justifie";
  time: string;
}

interface StudentStats {
  studentName: string;
  studentId: string;
  class: string;
  totalCourses: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendanceRate: number;
}

export function AttendanceTracker() {
  const [attendanceRecords] = useState<AttendanceRecord[]>([
    {
      id: "1",
      studentName: "Alice Dupont",
      studentId: "L1INFO001",
      class: "L1-INFO",
      subject: "Mathématiques",
      date: "2024-03-15",
      status: "present",
      time: "08:00"
    },
    {
      id: "2",
      studentName: "Bob Martin",
      studentId: "L1INFO002",
      class: "L1-INFO",
      subject: "Mathématiques",
      date: "2024-03-15",
      status: "absent",
      time: "08:00"
    },
    {
      id: "3",
      studentName: "Charlie Leroy",
      studentId: "L1INFO003",
      class: "L1-INFO",
      subject: "Mathématiques",
      date: "2024-03-15",
      status: "retard",
      time: "08:15"
    }
  ]);

  const [studentStats] = useState<StudentStats[]>([
    {
      studentName: "Alice Dupont",
      studentId: "L1INFO001",
      class: "L1-INFO",
      totalCourses: 48,
      presentCount: 45,
      absentCount: 2,
      lateCount: 1,
      attendanceRate: 93.8
    },
    {
      studentName: "Bob Martin",
      studentId: "L1INFO002",
      class: "L1-INFO", 
      totalCourses: 48,
      presentCount: 38,
      absentCount: 8,
      lateCount: 2,
      attendanceRate: 79.2
    }
  ]);

  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  const classes = ["L1-INFO", "L2-INFO", "L3-INFO", "M1-INFO", "M2-INFO"];
  const subjects = ["Mathématiques", "Programmation", "Base de Données", "Réseaux", "Anglais"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present": return "bg-green-500/20 text-green-700";
      case "absent": return "bg-red-500/20 text-red-700";
      case "retard": return "bg-yellow-500/20 text-yellow-700";
      case "justifie": return "bg-blue-500/20 text-blue-700";
      default: return "bg-gray-500/20 text-gray-700";
    }
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return "text-green-600";
    if (rate >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Suivi des Présences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="daily">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="daily">Présences du jour</TabsTrigger>
              <TabsTrigger value="stats">Statistiques</TabsTrigger>
              <TabsTrigger value="alerts">Alertes</TabsTrigger>
              <TabsTrigger value="reports">Rapports</TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Classe</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les classes</SelectItem>
                      {classes.map((cls) => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Matière</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les matières</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                </div>
                <div className="flex items-end">
                  <Button className="w-full">
                    <Search className="w-4 h-4 mr-2" />
                    Rechercher
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Présences - {selectedDate || "Aujourd'hui"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {attendanceRecords.map((record) => (
                        <div key={record.id} className="flex justify-between items-center p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div>
                              <span className="font-semibold">{record.studentName}</span>
                              <span className="text-sm text-muted-foreground ml-2">
                                ({record.studentId})
                              </span>
                            </div>
                            <Badge variant="outline">{record.class}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {record.subject} - {record.time}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(record.status)}>
                              {record.status}
                            </Badge>
                            <Button size="sm" variant="outline">Modifier</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="glass">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">87%</div>
                      <div className="text-sm text-muted-foreground">Taux de présence général</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">24</div>
                      <div className="text-sm text-muted-foreground">Étudiants à risque</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">156</div>
                      <div className="text-sm text-muted-foreground">Absences cette semaine</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="glass">
                <CardHeader>
                  <CardTitle>Statistiques par étudiant</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {studentStats.map((student, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">{student.studentName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {student.studentId} - {student.class}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`text-xl font-bold ${getAttendanceColor(student.attendanceRate)}`}>
                              {student.attendanceRate.toFixed(1)}%
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {student.presentCount}/{student.totalCourses} cours
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-center text-sm">
                          <div>
                            <div className="font-semibold text-green-600">{student.presentCount}</div>
                            <div className="text-muted-foreground">Présences</div>
                          </div>
                          <div>
                            <div className="font-semibold text-red-600">{student.absentCount}</div>
                            <div className="text-muted-foreground">Absences</div>
                          </div>
                          <div>
                            <div className="font-semibold text-yellow-600">{student.lateCount}</div>
                            <div className="text-muted-foreground">Retards</div>
                          </div>
                        </div>
                        
                        <Progress value={student.attendanceRate} className="mt-3" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <div className="grid gap-4">
                <Card className="glass border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700">
                      <AlertTriangle className="w-5 h-5" />
                      Étudiants à risque (&lt;75% présence)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {studentStats
                        .filter(student => student.attendanceRate < 75)
                        .map((student, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-red-50 rounded">
                            <div>
                              <span className="font-semibold">{student.studentName}</span>
                              <span className="text-sm text-muted-foreground ml-2">
                                {student.class}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-red-600 font-semibold">
                                {student.attendanceRate.toFixed(1)}%
                              </span>
                              <Button size="sm">Contacter</Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass border-yellow-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-700">
                      <TrendingDown className="w-5 h-5" />
                      Absences répétées (3+ consécutives)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                        <div>
                          <span className="font-semibold">David Bernard</span>
                          <span className="text-sm text-muted-foreground ml-2">L2-INFO</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-600">5 absences consécutives</span>
                          <Button size="sm">Signaler</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Rapports de présence</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Période</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une période" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="week">Cette semaine</SelectItem>
                          <SelectItem value="month">Ce mois</SelectItem>
                          <SelectItem value="semester">Ce semestre</SelectItem>
                          <SelectItem value="year">Cette année</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Format</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Format de sortie" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Générer rapport
                    </Button>
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Actions rapides</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full" variant="outline">
                      <Calendar className="w-4 h-4 mr-2" />
                      Feuille d'émargement
                    </Button>
                    <Button className="w-full" variant="outline">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Lettres d'avertissement
                    </Button>
                    <Button className="w-full" variant="outline">
                      <UserCheck className="w-4 h-4 mr-2" />
                      Certificats d'assiduité
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export annuel
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