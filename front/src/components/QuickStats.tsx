import { Card } from "@/components/ui/card";
import { TrendingUp, Calendar, Clock, Trophy } from "lucide-react";

export const QuickStats = () => {
  const stats = [
    {
      title: "Moyenne générale",
      value: "16.2",
      unit: "/20",
      icon: TrendingUp,
      trend: "+0.5",
      color: "text-green-600"
    },
    {
      title: "Cours cette semaine",
      value: "12",
      unit: "heures",
      icon: Calendar,
      trend: "+2",
      color: "text-blue-600"
    },
    {
      title: "Prochain cours",
      value: "2h30",
      unit: "restantes",
      icon: Clock,
      trend: "Algorithmique",
      color: "text-orange-600"
    },
    {
      title: "Rang promotion",
      value: "8",
      unit: "/45",
      icon: Trophy,
      trend: "+2 places",
      color: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="glass-card hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-bold">{stat.value}</span>
                  <span className="text-sm text-muted-foreground">{stat.unit}</span>
                </div>
                <p className={`text-xs ${stat.color} font-medium`}>{stat.trend}</p>
              </div>
              <div className={`glass p-3 rounded-xl ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};