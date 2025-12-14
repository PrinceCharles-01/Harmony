import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, BarChart3 } from "lucide-react";
import { useState } from "react";

export const GradesChart = () => {
  const [viewMode, setViewMode] = useState<'evolution' | 'comparison'>('evolution');
  const [selectedSemester, setSelectedSemester] = useState('S1');

  const evolutionData = [
    { matiere: 'Sept', moyenne: 14.5, objectif: 16 },
    { matiere: 'Oct', moyenne: 15.2, objectif: 16 },
    { matiere: 'Nov', moyenne: 15.8, objectif: 16 },
    { matiere: 'Déc', moyenne: 16.1, objectif: 16 },
    { matiere: 'Jan', moyenne: 16.2, objectif: 16 },
  ];

  const comparisonData = [
    { matiere: 'Algorithmique', note: 17.5, moyenne_promo: 14.2, coefficient: 3 },
    { matiere: 'Base de Données', note: 16.0, moyenne_promo: 15.1, coefficient: 2 },
    { matiere: 'Réseaux', note: 15.5, moyenne_promo: 13.8, coefficient: 2 },
    { matiere: 'Intelligence Artificielle', note: 18.0, moyenne_promo: 15.5, coefficient: 4 },
    { matiere: 'Génie Logiciel', note: 14.5, moyenne_promo: 14.0, coefficient: 3 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border-0">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name.includes('note') || entry.name.includes('moyenne') ? '/20' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="glass-card">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Analyse des Notes</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger className="w-24 glass">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card">
                <SelectItem value="S1">S1</SelectItem>
                <SelectItem value="S2">S2</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant={viewMode === 'evolution' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('evolution')}
              className="glass"
            >
              Évolution
            </Button>
            <Button
              variant={viewMode === 'comparison' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('comparison')}
              className="glass"
            >
              Comparaison
            </Button>
          </div>
        </div>
      </div>

      {viewMode === 'evolution' ? (
        <div>
          <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass p-3 rounded-xl text-center">
              <p className="text-xs text-muted-foreground">Progression</p>
              <p className="text-lg font-bold text-green-600">+1.7</p>
            </div>
            <div className="glass p-3 rounded-xl text-center">
              <p className="text-xs text-muted-foreground">Objectif atteint</p>
              <p className="text-lg font-bold text-primary">✓</p>
            </div>
            <div className="glass p-3 rounded-xl text-center">
              <p className="text-xs text-muted-foreground">Tendance</p>
              <p className="text-lg font-bold text-blue-600">↗</p>
            </div>
            <div className="glass p-3 rounded-xl text-center">
              <p className="text-xs text-muted-foreground">Prédiction S2</p>
              <p className="text-lg font-bold text-violet-600">16.5</p>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="matiere" 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  domain={[12, 20]}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="moyenne" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  name="Ma moyenne"
                />
                <Line 
                  type="monotone" 
                  dataKey="objectif" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: 'hsl(var(--muted-foreground))', r: 3 }}
                  name="Objectif"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Badge variant="outline" className="glass">
              <BarChart3 className="w-3 h-3 mr-1" />
              Comparaison avec la promotion
            </Badge>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="matiere" 
                  axisLine={false}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  domain={[0, 20]}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="moyenne_promo" 
                  fill="hsl(var(--muted))" 
                  name="Moyenne promo"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="note" 
                  fill="hsl(var(--primary))" 
                  name="Ma note"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 space-y-2">
            {comparisonData.map((item, index) => (
              <div key={index} className="flex items-center justify-between glass p-2 rounded-lg">
                <span className="text-sm font-medium">{item.matiere}</span>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={item.note > item.moyenne_promo ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {item.note > item.moyenne_promo ? '+' : ''}{(item.note - item.moyenne_promo).toFixed(1)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Coef. {item.coefficient}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};