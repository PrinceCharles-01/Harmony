import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Filter, Edit, Trash2, MoreHorizontal } from "lucide-react";

export const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const users = [
    {
      id: 1,
      name: "Marie Dupont",
      email: "marie.dupont@universite.fr",
      role: "Étudiant",
      department: "Informatique",
      status: "Actif",
      lastLogin: "Il y a 2h",
      avatar: ""
    },
    {
      id: 2,
      name: "Prof. Jean Martin", 
      email: "j.martin@universite.fr",
      role: "Enseignant",
      department: "Mathématiques",
      status: "Actif",
      lastLogin: "Il y a 1h",
      avatar: ""
    },
    {
      id: 3,
      name: "Sophie Bernard",
      email: "s.bernard@universite.fr", 
      role: "Administrateur",
      department: "Administration",
      status: "Actif",
      lastLogin: "Il y a 30min",
      avatar: ""
    },
    {
      id: 4,
      name: "Pierre Rousseau",
      email: "p.rousseau@universite.fr",
      role: "Étudiant", 
      department: "Physique",
      status: "Inactif",
      lastLogin: "Il y a 3 jours",
      avatar: ""
    }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Administrateur":
        return "bg-red-100 text-red-800 border-red-200";
      case "Enseignant":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Étudiant":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "Actif" 
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-gray-100 text-gray-800 border-gray-200";
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Gestion des utilisateurs</h2>
            <p className="text-muted-foreground">
              Gérez les comptes utilisateurs de votre établissement
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un utilisateur
          </Button>
        </div>
      </Card>

      {/* Filters */}
      <Card className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrer par rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              <SelectItem value="Administrateur">Administrateur</SelectItem>
              <SelectItem value="Enseignant">Enseignant</SelectItem>
              <SelectItem value="Étudiant">Étudiant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Users List */}
      <Card className="glass-card p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Utilisateurs ({filteredUsers.length})
            </h3>
          </div>

          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 glass rounded-lg hover:bg-accent/10 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{user.name}</p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getRoleColor(user.role)}`}
                      >
                        {user.role}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(user.status)}`}
                      >
                        {user.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                      <span>{user.department}</span>
                      <span>•</span>
                      <span>Dernière connexion: {user.lastLogin}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};