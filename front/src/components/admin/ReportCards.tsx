import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { FileText, Download, Send, Eye, Filter, TrendingUp, Award } from "lucide-react";

interface ReportCard {
  id: string;
  studentName: string;
  studentId: string;
  class: string;
  semester: string;
  average: number;
  status: "en_cours" | "valide" | "envoye";
  subjects: {
    name: string;
    grade: number;
    coefficient: number;
    credits: number;
  }[];
}

export function ReportCards() {
  const [reportCards] = useState<ReportCard[]>([
    {
      id: "1",
      studentName: "Alice Dupont",
      studentId: "L1INFO001",
      class: "L1-INFO",
      semester: "S1",
      average: 14.5,
      status: "valide",
      subjects: [
        { name: "Mathématiques", grade: 16, coefficient: 3, credits: 6 },
        { name: "Programmation", grade: 13, coefficient: 3, credits: 6 },
        { name: "Anglais", grade: 15, coefficient: 2, credits: 3 }
      ]
    },
    {
      id: "2",
      studentName: "Bob Martin",
      studentId: "L1INFO002", 
      class: "L1-INFO",
      semester: "S1",
      average: 11.2,
      status: "en_cours",
      subjects: [
        { name: "Mathématiques", grade: 12, coefficient: 3, credits: 6 },
        { name: "Programmation", grade: 10, coefficient: 3, credits: 6 },
        { name: "Anglais", grade: 12, coefficient: 2, credits: 3 }
      ]
    }
  ]);

  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const classes = ["L1-INFO", "L2-INFO", "L3-INFO", "M1-INFO", "M2-INFO"];
  const semesters = ["S1", "S2", "S3", "S4", "S5", "S6"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "en_cours": return "bg-yellow-500/20 text-yellow-700";
      case "valide": return "bg-green-500/20 text-green-700";
      case "envoye": return "bg-blue-500/20 text-blue-700";
      default: return "bg-gray-500/20 text-gray-700";
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 16) return "text-green-600";
    if (grade >= 14) return "text-blue-600";
    if (grade >= 12) return "text-orange-600";
    if (grade >= 10) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredReportCards = reportCards.filter(card => {
    return (selectedClass === "all" || card.class === selectedClass) &&
           (selectedSemester === "all" || card.semester === selectedSemester) &&
           (selectedStatus === "all" || card.status === selectedStatus);
  });

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Bulletins de Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="list">Bulletins</TabsTrigger>
              <TabsTrigger value="generate">Générer</TabsTrigger>
              <TabsTrigger value="stats">Statistiques</TabsTrigger>
              <TabsTrigger value="templates">Modèles</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
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
                  <Label>Semestre</Label>
                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les semestres</SelectItem>
                      {semesters.map((semester) => (
                        <SelectItem key={semester} value={semester}>{semester}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Statut</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="en_cours">En cours</SelectItem>
                      <SelectItem value="valide">Validé</SelectItem>
                      <SelectItem value="envoye">Envoyé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button className="w-full">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrer
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                {filteredReportCards.map((card) => (
                  <Card key={card.id} className="glass">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{card.studentName}</h3>
                            <Badge variant="outline">{card.studentId}</Badge>
                            <Badge className={getStatusColor(card.status)}>
                              {card.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {card.class} - {card.semester}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            <span className={getGradeColor(card.average)}>
                              {card.average.toFixed(1)}
                            </span>
                            <span className="text-lg text-muted-foreground">/20</span>
                          </div>
                          <div className="text-sm text-muted-foreground">Moyenne générale</div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {card.subjects.map((subject, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                            <div className="flex-1">
                              <span className="font-medium">{subject.name}</span>
                              <span className="text-sm text-muted-foreground ml-2">
                                (Coef. {subject.coefficient}, {subject.credits} ECTS)
                              </span>
                            </div>
                            <div className={`font-semibold ${getGradeColor(subject.grade)}`}>
                              {subject.grade.toFixed(1)}/20
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          Voir
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-1" />
                          PDF
                        </Button>
                        <Button size="sm" variant="outline">
                          <Send className="w-4 h-4 mr-1" />
                          Envoyer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="generate" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Génération par classe</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                      <Label>Semestre</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un semestre" />
                        </SelectTrigger>
                        <SelectContent>
                          {semesters.map((semester) => (
                            <SelectItem key={semester} value={semester}>{semester}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full">
                      <FileText className="w-4 h-4 mr-2" />
                      Générer tous les bulletins
                    </Button>
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Génération individuelle</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Étudiant</Label>
                      <Input placeholder="Nom ou numéro étudiant" />
                    </div>
                    <div>
                      <Label>Période</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une période" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="s1">Semestre 1</SelectItem>
                          <SelectItem value="s2">Semestre 2</SelectItem>
                          <SelectItem value="annuel">Année complète</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full">
                      <FileText className="w-4 h-4 mr-2" />
                      Générer le bulletin
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="glass">
                <CardHeader>
                  <CardTitle>Options de génération</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span>Inclure les appréciations</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span>Graphiques de progression</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span>Comparaison classe</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span>Signature numérique</span>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Moyennes générales
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>L1-INFO</span>
                          <span>12.4/20</span>
                        </div>
                        <Progress value={62} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>L2-INFO</span>
                          <span>13.8/20</span>
                        </div>
                        <Progress value={69} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>L3-INFO</span>
                          <span>14.2/20</span>
                        </div>
                        <Progress value={71} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Taux de réussite
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">85%</div>
                        <div className="text-sm text-muted-foreground">Validation S1</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">78%</div>
                        <div className="text-sm text-muted-foreground">Passage année sup.</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Actions rapides</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full" variant="outline" size="sm">
                      Bulletins en attente
                    </Button>
                    <Button className="w-full" variant="outline" size="sm">
                      Envoyer rappels
                    </Button>
                    <Button className="w-full" variant="outline" size="sm">
                      Export Excel
                    </Button>
                    <Button className="w-full" variant="outline" size="sm">
                      Archiver semestre
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Modèle Standard</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Format classique avec en-tête établissement, notes par matière, moyenne générale et appréciations.
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm">Utiliser</Button>
                        <Button size="sm" variant="outline">Modifier</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Modèle Détaillé</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Inclut graphiques de progression, comparaison avec la classe, et historique des notes.
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm">Utiliser</Button>
                        <Button size="sm" variant="outline">Modifier</Button>
                      </div>
                    </div>
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