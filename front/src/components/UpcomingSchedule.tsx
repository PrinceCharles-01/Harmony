import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, User, Calendar, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface UpcomingScheduleProps {
  showAll?: boolean;
}

interface ScheduleItem {
  subject: string;
  type: string;
  time: string;
  date: string;
  room: string;
  professor: string;
  color: string;
  ue: string;
}

export const UpcomingSchedule = ({ showAll = false }: UpcomingScheduleProps) => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch("/api/academics/schedule/");

        if (!response.ok) {
          throw new Error(`Erreur serveur: ${response.status}`);
        }

        const data = await response.json();
        setSchedule(data);
      } catch (error) {
        toast.error("Impossible de charger l'emploi du temps. Veuillez réessayer.");
        setSchedule([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const displayedSchedule = showAll ? schedule : schedule.slice(0, 3);

  const getTypeVariant = (type: string) => {
    switch (type) {
      case "Cours Magistral":
        return "default";
      case "Travaux Pratiques":
        return "secondary";
      case "Travaux Dirigés":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Demain";
    } else {
      return date.toLocaleDateString('fr-FR', { weekday: 'long', month: 'short', day: 'numeric' });
    }
  };

  const getColorClasses = (colorClass: string) => {
    switch (colorClass) {
      case 'bg-primary': return { border: 'border-l-primary', bg: 'bg-primary/10' };
      case 'bg-emerald-500': return { border: 'border-l-emerald-500', bg: 'bg-emerald-500/10' };
      case 'bg-violet-500': return { border: 'border-l-violet-500', bg: 'bg-violet-500/10' };
      case 'bg-amber-500': return { border: 'border-l-amber-500', bg: 'bg-amber-500/10' };
      case 'bg-rose-500': return { border: 'border-l-rose-500', bg: 'bg-rose-500/10' };
      default: return { border: 'border-l-primary', bg: 'bg-primary/10' };
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <div className="p-4">Chargement de l'emploi du temps...</div>
      </Card>
    );
  }

  if (schedule.length === 0) {
    return (
      <Card className="glass-card">
        <div className="p-4">Aucun cours à venir pour le moment.</div>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Emploi du temps</h3>
        </div>
        {!showAll && (
          <Badge variant="outline" className="glass">
            Prochains cours
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        {displayedSchedule.map((item, index) => {
          const colorClasses = getColorClasses(item.color);
          return (
            <div
              key={index}
              className={`p-4 glass rounded-xl hover:bg-accent/10 transition-all duration-300 border-l-4 ${colorClasses.border} ${colorClasses.bg} hover:scale-[1.02]`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-foreground text-base">{item.subject}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <BookOpen className="w-3 h-3 text-primary" />
                        <span className="text-xs text-foreground/70">{item.ue}</span>
                      </div>
                    </div>
                    <Badge variant={getTypeVariant(item.type)} className="text-xs font-medium">
                      {item.type}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-foreground/80">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <div>
                        <div className="font-medium">{formatDate(item.date)}</div>
                        <div className="text-xs text-foreground/60">{item.time}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-medium">{item.room}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-primary" />
                      <span className="font-medium">{item.professor}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showAll && (
        <div className="mt-6 text-center">
          <Badge variant="outline" className="glass cursor-pointer hover:bg-primary/10 transition-colors">
            <Calendar className="w-3 h-3 mr-1" />
            Voir le calendrier complet
          </Badge>
        </div>
      )}
    </Card>
  );
};