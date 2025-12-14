import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Download, Upload, Calculator, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getCookie } from "@/lib/utils";

export const GradeEntry = () => {
  // State for raw data from API
  const [classes, setClasses] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [ues, setUes] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isStudentsLoading, setIsStudentsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // State for selections
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedUe, setSelectedUe] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedEvaluation, setSelectedEvaluation] = useState("");
  
  // State for grades
  const [grades, setGrades] = useState<Record<string, string>>({});

  // Fetch all initial data once
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [classesRes, semestersRes, uesRes, subjectsRes] = await Promise.all([
          fetch("/api/classes/"),
          fetch("/api/semestres/"),
          fetch("/api/ues/"),
          fetch("/api/subjects/"),
        ]);

        // Check if all responses are ok
        if (!classesRes.ok || !semestersRes.ok || !uesRes.ok || !subjectsRes.ok) {
          throw new Error("Erreur lors du chargement des données");
        }

        const [classesData, semestersData, uesData, subjectsData] = await Promise.all([
          classesRes.json(),
          semestersRes.json(),
          uesRes.json(),
          subjectsRes.json(),
        ]);
        setClasses(classesData);
        setSemesters(semestersData);
        setUes(uesData);
        setSubjects(subjectsData);
      } catch (error) {
        toast.error("Erreur lors du chargement des données initiales.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch students when a class is selected
  useEffect(() => {
    if (selectedClass) {
      const fetchStudents = async () => {
        setIsStudentsLoading(true);
        try {
          const response = await fetch(`/api/students-by-class/?class_id=${selectedClass}`);

          if (!response.ok) {
            throw new Error(`Erreur serveur: ${response.status}`);
          }

          const data = await response.json();
          setStudents(data);
          setGrades({}); // Reset grades when students change
        } catch (error) {
          toast.error("Erreur lors du chargement des étudiants.");
          setStudents([]);
        } finally {
          setIsStudentsLoading(false);
        }
      };
      fetchStudents();
    } else {
      setStudents([]);
    }
  }, [selectedClass]);

  // Memoized filtered lists for cascading dropdowns
  const filteredUes = useMemo(() => {
    if (!selectedSemester) return [];
    const semesterId = semesters.find(s => s.id.toString() === selectedSemester)?.id;
    if (!semesterId) return [];
    return ues.filter(ue => ue.semestre_id === semesterId);
  }, [selectedSemester, ues, semesters]);

  const filteredSubjects = useMemo(() => {
    if (!selectedUe) return [];
    return subjects.filter(subject => subject.ue_id.toString() === selectedUe);
  }, [selectedUe, subjects]);

  // Reset dependent dropdowns when a parent changes
  useEffect(() => {
    setSelectedUe("");
    setSelectedSubject("");
  }, [selectedSemester]);

  useEffect(() => {
    setSelectedSubject("");
  }, [selectedUe]);

  const evaluationTypes = [
    { id: "cc", name: "Contrôle Continu" },
    { id: "examen", name: "Examen Final" },
  ];

  const handleGradeChange = (studentId: string, value: string) => {
    const numValue = parseFloat(value);
    if (value === "" || (!isNaN(numValue) && numValue >= 0 && numValue <= 20)) {
      setGrades(prev => ({ ...prev, [studentId]: value }));
    }
  };

  const calculateAverage = () => {
    const validGrades = Object.values(grades).filter(g => g !== "" && !isNaN(parseFloat(g)));
    if (validGrades.length === 0) return 0;
    const sum = validGrades.reduce((acc, grade) => acc + parseFloat(grade), 0);
    return (sum / validGrades.length).toFixed(2);
  };

  const handleSave = async () => {
    if (Object.keys(grades).length === 0) {
      toast.warning("Aucune note à enregistrer.");
      return;
    }
    setIsSaving(true);
    try {
      const csrfToken = getCookie('csrftoken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }

      const payload = {
        class: selectedClass,
        subject: selectedSubject,
        evaluation: selectedEvaluation,
        grades: grades,
      };
      const response = await fetch("/api/save-grades/", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Une erreur est survenue.");
      }

      const result = await response.json();
      toast.success(result.message || "Notes enregistrées avec succès !");
      setGrades({}); // Clear grades after successful save
    } catch (error: any) {
      toast.error(`Erreur: ${error.message || "Impossible d'enregistrer les notes"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const canShowTable = selectedClass && selectedSemester && selectedUe && selectedSubject && selectedEvaluation;

  return (
    <div className="space-y-6">
      <Card className="glass-card p-6">
        <h2 className="text-2xl font-bold gradient-text mb-2">Saisie des Notes</h2>
        <p className="text-muted-foreground mb-6">
          Gestion des évaluations par classe, matière et semestre.
        </p>

        <Tabs defaultValue="saisie" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="saisie">Saisie des Notes</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
          </TabsList>

          <TabsContent value="saisie" className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Dropdowns */}
                <div>
                  <Label htmlFor="class">Classe/Niveau *</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {classes.map((classe) => (
                        <SelectItem key={classe.id} value={classe.id.toString()}>
                          {classe.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="semester">Semestre *</Label>
                  <Select value={selectedSemester} onValueChange={setSelectedSemester} disabled={!selectedClass}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {semesters.map((semester) => (
                        <SelectItem key={semester.id} value={semester.id.toString()}>
                          {semester.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ue">Unité d'Enseignement *</Label>
                  <Select value={selectedUe} onValueChange={setSelectedUe} disabled={!selectedSemester}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {filteredUes.length > 0 ? (
                        filteredUes.map((ue) => (
                          <SelectItem key={ue.id} value={ue.id.toString()}>
                            {ue.nom}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="text-center text-sm text-muted-foreground p-4">Aucune UE pour ce semestre.</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject">Matière *</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedUe}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {filteredSubjects.length > 0 ? (
                        filteredSubjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id.toString()}>
                            {subject.nom}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="text-center text-sm text-muted-foreground p-4">Aucune matière pour cette UE.</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="evaluation">Type d'évaluation *</Label>
                  <Select value={selectedEvaluation} onValueChange={setSelectedEvaluation} disabled={!selectedSubject}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {evaluationTypes.map((evalType) => (
                        <SelectItem key={evalType.id} value={evalType.id}>
                          {evalType.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {isStudentsLoading && (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Chargement des étudiants...</p>
              </div>
            )}

            {!isStudentsLoading && canShowTable && (
              <Card className="glass animate-in fade-in-0 slide-in-from-bottom-4 duration-500 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Liste des Étudiants</h3>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> Exporter</Button>
                    <Button variant="outline" size="sm"><Upload className="mr-2 h-4 w-4" /> Importer</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Enregistrer
                    </Button>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Matricule</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Prénom</TableHead>
                      <TableHead className="w-[150px] text-center">Note / 20</TableHead>
                      <TableHead className="w-[100px] text-center">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.length > 0 ? (
                      students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-mono">{student.studentNumber}</TableCell>
                          <TableCell>{student.last_name}</TableCell>
                          <TableCell>{student.first_name}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="20"
                              step="0.25"
                              value={grades[student.id] || ""}
                              onChange={(e) => handleGradeChange(student.id, e.target.value)}
                              className="text-center"
                              placeholder="--"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            {grades[student.id] ? (
                              <Badge variant={parseFloat(grades[student.id]) >= 10 ? "success" : "destructive"}>
                                {parseFloat(grades[student.id]) >= 10 ? "Validé" : "Non validé"}
                              </Badge>
                            ) : (
                              <Badge variant="outline">En attente</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">
                          Aucun étudiant trouvé pour cette classe.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                 <div className="flex justify-end items-center mt-4 gap-4">
                    <div className="flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-muted-foreground" />
                        <span className="font-semibold">Moyenne de la classe:</span>
                        <span className="text-lg font-bold text-primary">{calculateAverage()}</span>
                    </div>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <p className="text-center text-muted-foreground">Les statistiques seront bientôt disponibles ici.</p>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
