import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Bot, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCookie } from "@/lib/utils";

interface AcademicYear {
  id: number;
  nom: string;
}

export const ScheduleGenerator = () => {
  const { toast } = useToast();
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>("heuristic");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await fetch("/api/annees-academiques/");
        if (!response.ok) throw new Error('Failed to fetch academic years');
        const data = await response.json();
        setAcademicYears(data);
        if (data.length > 0) {
          setSelectedYear(data[0].id.toString());
        }
      } catch (error) {
        toast({ title: "Erreur", description: "Impossible de charger les années académiques.", variant: "destructive" });
      }
    };
    fetchYears();
  }, [toast]);

  const handleGenerateSchedule = async () => {
    if (!selectedYear) {
      toast({ title: "Erreur", description: "Veuillez sélectionner une année académique.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    toast({ title: "Génération en cours...", description: `Lancement de l'algorithme ${selectedAlgorithm}.` });

    try {
      const csrfToken = getCookie('csrftoken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }

      const response = await fetch("/api/academics/planifier/", {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          annee_academique_id: parseInt(selectedYear),
          algorithm: selectedAlgorithm
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Une erreur est survenue lors de la génération.');
      }

      toast({ title: "Succès !", description: result.message, variant: "default" });
      
      // Recharger la page pour rafraîchir le calendrier
      setTimeout(() => window.location.reload(), 1500);

    } catch (error: any) {
      toast({ title: "Échec de la génération", description: error.message || "Une erreur est survenue", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarIcon className="w-5 h-5 mr-2" />
          Générateur d'Emploi du Temps
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-4">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full sm:w-48 glass">
                <SelectValue placeholder="Année Académique" />
              </SelectTrigger>
              <SelectContent className="glass-card">
                {academicYears.map(year => (
                  <SelectItem key={year.id} value={year.id.toString()}>{year.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
              <SelectTrigger className="w-full sm:w-40 glass">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card">
                <SelectItem value="heuristic">Simple</SelectItem>
                <SelectItem value="ortools">Intelligent</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleGenerateSchedule} disabled={isGenerating} className="w-full sm:w-auto glass">
              <Bot className="w-4 h-4 mr-2" />
              {isGenerating ? 'Génération...' : 'Générer'}
            </Button>
        </div>
      </CardContent>
    </Card>
  );
};