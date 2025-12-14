import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap, UserCheck, AlertTriangle, TrendingUp, BookOpen } from "lucide-react";

export const AdminStats = () => {
  const stats = [
    {
      title: "Total Étudiants",
      value: "1,247",
      change: "+12%",
      changeType: "positive",
      icon: GraduationCap,
      color: "text-blue-600"
    },
    {
      title: "Personnel",
      value: "89",
      change: "+3%",
      changeType: "positive", 
      icon: UserCheck,
      color: "text-green-600"
    },
    {
      title: "Cours Actifs",
      value: "156",
      change: "+8%",
      changeType: "positive",
      icon: BookOpen,
      color: "text-purple-600"
    },
    {
      title: "Alertes",
      value: "4",
      change: "-2",
      changeType: "negative",
      icon: AlertTriangle,
      color: "text-red-600"
    }
  ];

  const recentActivity = [
    {
      type: "Nouvel étudiant",
      description: "Marie Dubois s'est inscrite en Master 2 Informatique",
      time: "Il y a 5 min",
      status: "success"
    },
    {
      type: "Note manquante",
      description: "Notes de contrôle continu manquantes - Mathématiques L1",
      time: "Il y a 15 min",
      status: "warning"
    },
    {
      type: "Nouveau cours",
      description: "Cours d'Intelligence Artificielle ajouté au programme",
      time: "Il y a 1h",
      status: "info"
    },
    {
      type: "Validation diplôme",
      description: "Diplôme Master validé pour Jean Martin",
      time: "Il y a 2h",
      status: "success"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className={`text-sm flex items-center ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stat.change}
                </p>
              </div>
              <div className={`${stat.color}`}>
                <stat.icon className="w-8 h-8" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Activité récente</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 glass rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.status === 'success' ? 'bg-green-500' :
                  activity.status === 'warning' ? 'bg-yellow-500' :
                  activity.status === 'info' ? 'bg-blue-500' : 'bg-gray-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.type}</p>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 glass rounded-lg cursor-pointer hover:bg-accent/10 transition-colors">
              <Users className="w-6 h-6 text-blue-600 mb-2" />
              <p className="text-sm font-medium">Ajouter utilisateur</p>
            </div>
            <div className="p-4 glass rounded-lg cursor-pointer hover:bg-accent/10 transition-colors">
              <BookOpen className="w-6 h-6 text-green-600 mb-2" />
              <p className="text-sm font-medium">Nouveau cours</p>
            </div>
            <div className="p-4 glass rounded-lg cursor-pointer hover:bg-accent/10 transition-colors">
              <GraduationCap className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-sm font-medium">Gérer diplômes</p>
            </div>
            <div className="p-4 glass rounded-lg cursor-pointer hover:bg-accent/10 transition-colors">
              <AlertTriangle className="w-6 h-6 text-red-600 mb-2" />
              <p className="text-sm font-medium">Voir alertes</p>
            </div>
          </div>
        </Card>
      </div>

      {/* System Status */}
      <Card className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">État du système</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 glass rounded-lg">
            <span className="text-sm">Base de données</span>
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              Opérationnel
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 glass rounded-lg">
            <span className="text-sm">Serveur de fichiers</span>
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              Opérationnel
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 glass rounded-lg">
            <span className="text-sm">Sauvegarde</span>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
              En cours
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};