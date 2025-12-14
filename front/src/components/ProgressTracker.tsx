import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Award, Calendar, CheckCircle } from "lucide-react";

export const ProgressTracker = () => {
  const objectives = [
    {
      id: 1,
      title: "Moyenne générale S1",
      current: 16.2,
      target: 16.0,
      progress: 102,
      status: 'achieved',
      deadline: '2024-01-31',
      category: 'academic'
    },
    {
      id: 2,
      title: "Projet IA - Milestone 1",
      current: 75,
      target: 100,
      progress: 75,
      status: 'in_progress',
      deadline: '2024-01-25',
      category: 'project'
    },
    {
      id: 3,
      title: "Assiduité cours",
      current: 95,
      target: 90,
      progress: 105,
      status: 'achieved',
      deadline: '2024-01-31',
      category: 'attendance'
    },
    {
      id: 4,
      title: "Certification AWS",
      current: 40,
      target: 100,
      progress: 40,
      status: 'in_progress',
      deadline: '2024-03-15',
      category: 'certification'
    }
  ];

  const achievements = [
    {
      title: "Top 10 de la promotion",
      description: "Classé 8ème sur 45 étudiants",
      date: "Il y a 2 jours",
      icon: Award,
      color: "text-amber-600"
    },
    {
      title: "Parfaite assiduité",
      description: "100% de présence ce mois",
      date: "Il y a 1 semaine",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Projet exemplaire",
      description: "Note de 19/20 en Génie Logiciel",
      date: "Il y a 2 semaines",
      icon: Target,
      color: "text-blue-600"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'achieved': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'at_risk': return 'text-orange-600';
      case 'behind': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'achieved': return { variant: 'default' as const, label: 'Atteint' };
      case 'in_progress': return { variant: 'secondary' as const, label: 'En cours' };
      case 'at_risk': return { variant: 'outline' as const, label: 'À risque' };
      case 'behind': return { variant: 'destructive' as const, label: 'En retard' };
      default: return { variant: 'outline' as const, label: 'En attente' };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic': return TrendingUp;
      case 'project': return Target;
      case 'attendance': return Calendar;
      case 'certification': return Award;
      default: return Target;
    }
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Échéance dépassée";
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Demain";
    if (diffDays < 7) return `Dans ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-6">
      {/* Objectifs en cours */}
      <Card className="glass-card">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Objectifs en cours</h3>
        </div>

        <div className="space-y-4">
          {objectives.map((objective) => {
            const CategoryIcon = getCategoryIcon(objective.category);
            const statusBadge = getStatusBadge(objective.status);
            
            return (
              <div key={objective.id} className="glass p-4 rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="glass p-2 rounded-lg">
                      <CategoryIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{objective.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Échéance: {formatDeadline(objective.deadline)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={statusBadge.variant} className="glass">
                    {statusBadge.label}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>
                      {objective.current}
                      {objective.category === 'academic' && '/20'} 
                      {objective.category === 'project' && '%'}
                      {objective.category === 'attendance' && '%'}
                      {objective.category === 'certification' && '%'}
                    </span>
                    <span className="text-muted-foreground">
                      Objectif: {objective.target}
                      {objective.category === 'academic' && '/20'}
                      {objective.category === 'project' && '%'}
                      {objective.category === 'attendance' && '%'}
                      {objective.category === 'certification' && '%'}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(objective.progress, 100)} 
                    className="h-2"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Réussites récentes */}
      <Card className="glass-card">
        <div className="flex items-center space-x-2 mb-4">
          <Award className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Réussites récentes</h3>
        </div>

        <div className="space-y-3">
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon;
            return (
              <div key={index} className="flex items-start space-x-3 glass p-3 rounded-lg">
                <div className={`glass p-2 rounded-lg ${achievement.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{achievement.title}</h4>
                  <p className="text-xs text-muted-foreground mb-1">{achievement.description}</p>
                  <p className="text-xs text-muted-foreground">{achievement.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Statistiques globales */}
      <Card className="glass-card">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">3</div>
            <div className="text-sm text-muted-foreground">Objectifs atteints</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">1</div>
            <div className="text-sm text-muted-foreground">En cours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">85%</div>
            <div className="text-sm text-muted-foreground">Taux de réussite</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">+2</div>
            <div className="text-sm text-muted-foreground">Places gagnées</div>
          </div>
        </div>
      </Card>
    </div>
  );
};