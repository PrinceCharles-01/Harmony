import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, BookOpen, ChevronDown, ChevronUp, MessageSquare, Send, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface RecentGradesProps {
  showAll?: boolean;
}

export const RecentGrades = ({ showAll = false }: RecentGradesProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [complaintText, setComplaintText] = useState("");
  const [yearsData, setYearsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await fetch('/api/student-grades/?user_id=6'); // Hardcoded user_id for now

        if (!response.ok) {
          throw new Error(`Erreur serveur: ${response.status}`);
        }

        const data = await response.json();
        setYearsData(data.grades_by_year || []);
      } catch (error) {
        toast.error("Impossible de charger les notes. Veuillez réessayer.");
        setYearsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  const getGradeColor = (grade: number | string | null) => {
    if (grade === null || grade === undefined) return "text-foreground/60";
    const numericGrade = typeof grade === 'string' ? parseFloat(grade) : grade;
    if (numericGrade >= 16) return "text-emerald-600";
    if (numericGrade >= 12) return "text-blue-600";
    if (numericGrade >= 10) return "text-amber-600";
    return "text-rose-600";
  };

  const getAverageColor = (average: number | string | null) => {
    if (average === null || average === undefined) return "text-foreground/60";
    const numericAverage = typeof average === 'string' ? parseFloat(average) : average;
    if (numericAverage >= 16) return "text-emerald-600";
    if (numericAverage >= 14) return "text-blue-600";
    if (numericAverage >= 12) return "text-violet-600";
    if (numericAverage >= 10) return "text-amber-600";
    return "text-rose-600";
  };

  const formatNumber = (num: string | number | null) => {
    if (num === null || num === undefined) return 'N/A';
    const numericValue = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(numericValue)) return 'N/A';
    return numericValue.toFixed(2);
  }

  if (loading) {
    return <Card className="glass-card"><div className="p-4">Chargement des notes...</div></Card>;
  }

  if (yearsData.length === 0) {
    return <Card className="glass-card"><div className="p-4">Aucune note disponible pour le moment.</div></Card>;
  }

  // For the detailed "showAll" view
  if (showAll) {
    return (
      <Card className="glass-card">
        {yearsData.map((year) => (
          <div key={year.annee_academique_id}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Relevé de notes</h3>
              </div>
              <Badge variant="secondary" className="glass">
                {year.annee_academique_nom}
              </Badge>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
              {year.semestres.map((semestre: any) => (
                <AccordionItem key={semestre.semestre_id} value={semestre.semestre_id.toString()} className="border-none">
                  <AccordionTrigger className="glass-card hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 glass rounded-full flex items-center justify-center">
                          <span className="font-bold text-primary">{semestre.semestre_nom.split(' - ')[1]}</span>
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-foreground">{semestre.semestre_nom}</p>
                          <p className="text-sm text-foreground/70">{semestre.ues.reduce((acc: number, ue: any) => acc + (ue.credits_obtenus || 0), 0)} crédits obtenus</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-bold ${getAverageColor(semestre.moyenne_semestre)}`}>
                          {formatNumber(semestre.moyenne_semestre)}
                        </div>
                        <div className="text-xs text-foreground/60">/20</div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="pb-0">
                    <div className="space-y-3 mt-4">
                      {semestre.ues.map((ue: any) => (
                        <div key={ue.ue_id} className="glass-card bg-accent/5">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <BookOpen className="w-4 h-4 text-primary" />
                              <span className="font-medium text-foreground">{ue.ue_nom}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge variant={ue.validee ? "default" : "destructive"} className="text-xs">
                                {ue.validee ? <CheckCircle className="w-3 h-3 mr-1"/> : <XCircle className="w-3 h-3 mr-1"/>}
                                {ue.credits_obtenus} crédits
                              </Badge>
                              <div className={`text-lg font-bold ${getAverageColor(ue.moyenne_ue)}`}>
                                {formatNumber(ue.moyenne_ue)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {ue.matieres.map((matiere: any, subjectIndex: number) => (
                              <div
                                key={subjectIndex}
                                className="flex items-center justify-between p-3 glass rounded-xl hover:bg-accent/20 transition-colors"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <p className="font-medium text-sm text-foreground">{matiere.matiere}</p>
                                  </div>
                                  <div className="flex items-center space-x-2 text-xs text-foreground/70 mt-1">
                                    <Badge variant="secondary" className="text-xs">
                                      {matiere.code_matiere}
                                    </Badge>
                                    <span>CC: {matiere.note_cc || '-'}</span>
                                    <span>•</span>
                                    <span>Exam: {matiere.note_examen || '-'}</span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                                        <MessageSquare className="w-4 h-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Réclamation de note</DialogTitle>
                                        <DialogDescription>
                                          Matière: {matiere.matiere} - Note: {formatNumber(matiere.note_finale)}/20
                                        </DialogDescription>
                                      </DialogHeader>
                                      <Textarea
                                        placeholder="Décrivez votre réclamation..."
                                        value={complaintText}
                                        onChange={(e) => setComplaintText(e.target.value)}
                                        className="min-h-[100px]"
                                      />
                                      <DialogFooter>
                                        <Button variant="outline" onClick={() => setComplaintText("")}>
                                          Annuler
                                        </Button>
                                        <Button onClick={() => {
                                          toast.success("Réclamation envoyée avec succès");
                                          setComplaintText("");
                                        }}>
                                          <Send className="w-4 h-4 mr-2" />
                                          Envoyer
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                  <div className="text-right">
                                    <div className={`text-xl font-bold ${getGradeColor(matiere.note_finale)}`}>
                                      {formatNumber(matiere.note_finale)}
                                    </div>
                                    <div className="text-xs text-foreground/60">/20</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-6 p-4 glass rounded-xl bg-primary/10 border border-primary/20">
              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">Moyenne générale de l'année</span>
                <span className={`text-2xl font-bold ${getAverageColor(year.moyenne_annee)}`}>
                  {formatNumber(year.moyenne_annee)}/20
                </span>
              </div>
            </div>
          </div>
        ))}
      </Card>
    );
  }

  // Simplified view for the dashboard
  const allUes = yearsData.flatMap(year => 
    year.semestres.flatMap((semestre: any) => semestre.ues)
  );
  const recentUes = allUes.slice(0, 4);
  const displayedUes = isExpanded ? allUes : recentUes;

  return (
    <Card className="glass-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Notes Récentes (par UE)</h3>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="glass">
            {displayedUes.length} UEs
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="space-y-3">
          {recentUes.map((ue: any) => (
            <div
              key={ue.ue_id}
              className="flex items-center justify-between p-3 glass rounded-xl hover:bg-accent/10 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-sm text-foreground">{ue.ue_nom}</p>
                <div className="flex items-center space-x-2 text-xs text-foreground/70 mt-1">
                  <Badge variant={ue.validee ? "default" : "destructive"} className="text-xs">
                     {ue.validee ? <CheckCircle className="w-3 h-3 mr-1"/> : <XCircle className="w-3 h-3 mr-1"/>}
                     {ue.credits_obtenus} crédits
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xl font-bold ${getAverageColor(ue.moyenne_ue)}`}>
                  {formatNumber(ue.moyenne_ue)}
                </div>
                <div className="text-xs text-foreground/60">/20</div>
              </div>
            </div>
          ))}
        </div>
        
        <CollapsibleContent className="space-y-3 mt-3">
          {allUes.slice(4).map((ue: any) => (
             <div
              key={ue.ue_id}
              className="flex items-center justify-between p-3 glass rounded-xl hover:bg-accent/10 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-sm text-foreground">{ue.ue_nom}</p>
                <div className="flex items-center space-x-2 text-xs text-foreground/70 mt-1">
                  <Badge variant={ue.validee ? "default" : "destructive"} className="text-xs">
                     {ue.validee ? <CheckCircle className="w-3 h-3 mr-1"/> : <XCircle className="w-3 h-3 mr-1"/>}
                     {ue.credits_obtenus} crédits
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xl font-bold ${getAverageColor(ue.moyenne_ue)}`}>
                  {formatNumber(ue.moyenne_ue)}
                </div>
                <div className="text-xs text-foreground/60">/20</div>
              </div>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};