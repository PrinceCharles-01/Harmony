import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Plus, Edit, Trash2, Users, Clock, FileText } from "lucide-react";
import { toast } from "sonner";
import { getCookie } from "@/lib/utils";

interface Subject {
  id: string;
  nom: string;
  code: string;
  description: string;
  credits: number;
  hours: number;
  semester: string;
  level: string;
  teacher: string;
  type: "obligatoire" | "optionnel" | "stage";
  prerequisites: string[];
}

export function SubjectManager() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [newSubject, setNewSubject] = useState({
    nom: "",
    code: "",
    description: "",
    credits: 0,
    hours: 0,
    semester: "",
    level: "",
    teacher: "",
    type: "obligatoire",
    prerequisites: [],
  });
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const fetchData = async () => {
    try {
      const [subjectsRes, teachersRes, levelsRes, semestersRes] = await Promise.all([
        fetch("/api/subjects/"),
        fetch("/api/teachers/"),
        fetch("/api/niveaux/"),
        fetch("/api/semestres/"),
      ]);
      const [subjectsData, teachersData, levelsData, semestersData] = await Promise.all([
        subjectsRes.json(),
        teachersRes.json(),
        levelsRes.json(),
        semestersRes.json(),
      ]);
      setSubjects(subjectsData);
      setTeachers(teachersData);
      setLevels(levelsData);
      setSemesters(semestersData);
    } catch (error) {
      toast.error("Erreur lors du chargement des données initiales.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "obligatoire": return "bg-red-500/20 text-red-700";
      case "optionnel": return "bg-blue-500/20 text-blue-700";
      case "stage": return "bg-green-500/20 text-green-700";
      default: return "bg-gray-500/20 text-gray-700";
    }
  };

  const filteredSubjects = subjects.filter(subject => {
    return (selectedLevel === "all" || subject.level === selectedLevel) &&
           (selectedType === "all" || subject.type === selectedType);
  });

  const handleNewSubjectChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewSubject(prev => ({ ...prev, [name]: value }));
  };

  const handleNewSubjectSelectChange = (name: string, value: string) => {
    setNewSubject(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateSubject = async () => {
    try {
      const csrfToken = getCookie('csrftoken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }

      const response = await fetch("/api/subjects/create/", {
        method: "POST",
        headers,
        body: JSON.stringify({
          nom: newSubject.nom,
          code: newSubject.code,
          credits: newSubject.credits,
          coeff_cc: 0.3, // Default value, can be made configurable
          coeff_examen: 0.7, // Default value, can be made configurable
          ue_id: newSubject.semester, // Assuming semester is the UE for now
        }),
      });

      if (response.ok) {
        toast.success("Matière créée avec succès!");
        fetchData(); // Refetch subjects to update the list
        setNewSubject({
          nom: "",
          code: "",
          description: "",
          credits: 0,
          hours: 0,
          semester: "",
          level: "",
          teacher: "",
          type: "obligatoire",
          prerequisites: [],
        });
      } else {
        toast.error("Erreur lors de la création de la matière.");
      }
    } catch (error) {
      toast.error("Erreur lors de la création de la matière.");
    }
  };

  const handleEditClick = (subject: Subject) => {
    setEditingSubject(subject);
  };

  const handleUpdateSubject = async () => {
    if (!editingSubject) return;
    try {
      const csrfToken = getCookie('csrftoken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }

      const response = await fetch(`/api/subjects/${editingSubject.id}/update/`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          nom: editingSubject.nom,
          code: editingSubject.code,
          credits: editingSubject.credits,
          coeff_cc: 0.3, // Default value, can be made configurable
          coeff_examen: 0.7, // Default value, can be made configurable
          ue_id: editingSubject.semester, // Assuming semester is the UE for now
        }),
      });

      if (response.ok) {
        toast.success("Matière mise à jour avec succès!");
        fetchData(); // Refetch subjects to update the list
        setEditingSubject(null);
      } else {
        toast.error("Erreur lors de la mise à jour de la matière.");
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour de la matière.");
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      const csrfToken = getCookie('csrftoken');
      const headers: HeadersInit = {};
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }

      const response = await fetch(`/api/subjects/${id}/delete/`, {
        method: "DELETE",
        headers,
      });

      if (response.ok) {
        toast.success("Matière supprimée avec succès!");
        fetchData(); // Refetch subjects to update the list
      } else {
        toast.error("Erreur lors de la suppression de la matière.");
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression de la matière.");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Gestion des Matières et UE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="list">Liste des Matières</TabsTrigger>
              <TabsTrigger value="create">Créer Matière</TabsTrigger>
              <TabsTrigger value="curriculum">Programme</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Niveau</Label>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les niveaux</SelectItem>
                      {levels.map((level) => (
                        <SelectItem key={level.id} value={level.code}>{level.nom}</SelectItem>
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
                      <SelectItem value="obligatoire">Obligatoire</SelectItem>
                      <SelectItem value="optionnel">Optionnel</SelectItem>
                      <SelectItem value="stage">Stage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle Matière
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                {filteredSubjects.map((subject) => (
                  <Card key={subject.id} className="glass">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{subject.nom}</h3>
                            <Badge variant="outline">{subject.code}</Badge>
                            <Badge className={getTypeColor(subject.type)}>
                              {subject.type}
                            </Badge>
                            <Badge variant="secondary">{subject.level} - {subject.semester}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {subject.description || ''}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              <span>{subject.credits} ECTS</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{subject.hours || 0}h</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{subject.teacher || 'N/A'}</span>
                            </div>
                            <div>
                              {subject.prerequisites?.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  Prérequis: {subject.prerequisites.join(", ")}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditClick(subject)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteSubject(subject.id)}>
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
                  <Label htmlFor="nom">Nom de la matière</Label>
                  <Input id="nom" name="nom" placeholder="Ex: Algorithmique et Programmation" value={newSubject.nom} onChange={handleNewSubjectChange} />
                </div>
                <div>
                  <Label htmlFor="code">Code</Label>
                  <Input id="code" name="code" placeholder="Ex: INFO101" value={newSubject.code} onChange={handleNewSubjectChange} />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="Description de la matière..." value={newSubject.description} onChange={handleNewSubjectChange} />
                </div>
                <div>
                  <Label htmlFor="credits">Crédits ECTS</Label>
                  <Input id="credits" name="credits" type="number" placeholder="6" value={newSubject.credits} onChange={handleNewSubjectChange} />
                </div>
                <div>
                  <Label htmlFor="hours">Volume horaire</Label>
                  <Input id="hours" name="hours" type="number" placeholder="60" value={newSubject.hours} onChange={handleNewSubjectChange} />
                </div>
                <div>
                  <Label htmlFor="level">Niveau</Label>
                  <Select value={newSubject.level} onValueChange={(value) => handleNewSubjectSelectChange("level", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level.id} value={level.code}>{level.nom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="semester">Semestre</Label>
                  <Select value={newSubject.semester} onValueChange={(value) => handleNewSubjectSelectChange("semester", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un semestre" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((semester) => (
                        <SelectItem key={semester.id} value={semester.id.toString()}>{semester.nom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="teacher">Enseignant responsable</Label>
                  <Select value={newSubject.teacher} onValueeChange={(value) => handleNewSubjectSelectChange("teacher", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un enseignant" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id.toString()}>{teacher.first_name} {teacher.last_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={newSubject.type} onValueChange={(value) => handleNewSubjectSelectChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type de matière" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="obligatoire">Obligatoire</SelectItem>
                      <SelectItem value="optionnel">Optionnel</SelectItem>
                      <SelectItem value="stage">Stage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full" onClick={handleCreateSubject}>
                <Plus className="w-4 h-4 mr-2" />
                Créer la matière
              </Button>
            </TabsContent>

            {editingSubject && (
              <TabsContent value="edit" className="space-y-4">
                <h3 className="text-xl font-bold">Modifier Matière: {editingSubject.nom}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-nom">Nom de la matière</Label>
                    <Input id="edit-nom" name="nom" value={editingSubject.nom} onChange={(e) => setEditingSubject(prev => prev ? { ...prev, nom: e.target.value } : null)} />
                  </div>
                  <div>
                    <Label htmlFor="edit-code">Code</Label>
                    <Input id="edit-code" name="code" value={editingSubject.code} onChange={(e) => setEditingSubject(prev => prev ? { ...prev, code: e.target.value } : null)} />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea id="edit-description" name="description" value={editingSubject.description} onChange={(e) => setEditingSubject(prev => prev ? { ...prev, description: e.target.value } : null)} />
                  </div>
                  <div>
                    <Label htmlFor="edit-credits">Crédits ECTS</Label>
                    <Input id="edit-credits" name="credits" type="number" value={editingSubject.credits} onChange={(e) => setEditingSubject(prev => prev ? { ...prev, credits: parseInt(e.target.value) } : null)} />
                  </div>
                  <div>
                    <Label htmlFor="edit-hours">Volume horaire</Label>
                    <Input id="edit-hours" name="hours" type="number" value={editingSubject.hours} onChange={(e) => setEditingSubject(prev => prev ? { ...prev, hours: parseInt(e.target.value) } : null)} />
                  </div>
                  <div>
                    <Label htmlFor="edit-level">Niveau</Label>
                    <Select value={editingSubject.level} onValueChange={(value) => setEditingSubject(prev => prev ? { ...prev, level: value } : null)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map((level) => (
                          <SelectItem key={level.id} value={level.code}>{level.nom}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-semester">Semestre</Label>
                    <Select value={editingSubject.semester} onValueChange={(value) => setEditingSubject(prev => prev ? { ...prev, semester: value } : null)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {semesters.map((semester) => (
                          <SelectItem key={semester.id} value={semester.id.toString()}>{semester.nom}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-teacher">Enseignant responsable</Label>
                    <Select value={editingSubject.teacher} onValueChange={(value) => setEditingSubject(prev => prev ? { ...prev, teacher: value } : null)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id.toString()}>{teacher.first_name} {teacher.last_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-type">Type</Label>
                    <Select value={editingSubject.type} onValueChange={(value) => setEditingSubject(prev => prev ? { ...prev, type: value as "obligatoire" | "optionnel" | "stage" } : null)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="obligatoire">Obligatoire</SelectItem>
                        <SelectItem value="optionnel">Optionnel</SelectItem>
                        <SelectItem value="stage">Stage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setEditingSubject(null)}>
                    Annuler
                  </Button>
                  <Button onClick={handleUpdateSubject}>
                    <Edit className="w-4 h-4 mr-2" />
                    Mettre à jour la matière
                  </Button>
                </div>
              </TabsContent>
            )}

            <TabsContent value="curriculum" className="space-y-4">
              <div className="grid gap-6">
                {levels.map((level) => (
                  <Card key={level.id} className="glass">
                    <CardHeader>
                      <CardTitle>{level.nom} - Programme</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Semestre {level.code === 'L1' ? '1' : level.code === 'L2' ? '3' : '5'}</h4>
                          <div className="space-y-2">
                            {subjects
                              .filter(s => s.level === level.code && ['S1', 'S3', 'S5', 'S7', 'S9'].includes(s.semester))
                              .map((subject) => (
                                <div key={subject.id} className="flex justify-between items-center p-2 border rounded">
                                  <span className="text-sm">{subject.nom}</span>
                                  <span className="text-xs text-muted-foreground">{subject.credits} ECTS</span>
                                </div>
                              ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Semestre {level.code === 'L1' ? '2' : level.code === 'L2' ? '4' : '6'}</h4>
                          <div className="space-y-2">
                            {subjects
                              .filter(s => s.level === level.code && ['S2', 'S4', 'S6', 'S8', 'S10'].includes(s.semester))
                              .map((subject) => (
                                <div key={subject.id} className="flex justify-between items-center p-2 border rounded">
                                  <span className="text-sm">{subject.nom}</span>
                                  <span className="text-xs text-muted-foreground">{subject.credits} ECTS</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
