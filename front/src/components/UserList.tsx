import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

export const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users/');

        if (!response.ok) {
          throw new Error(`Erreur serveur: ${response.status}`);
        }

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        toast.error("Impossible de charger les utilisateurs.");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <Card className="glass-card"><div className="p-4">Chargement des utilisateurs...</div></Card>;
  }

  if (users.length === 0) {
    return <Card className="glass-card"><div className="p-4">Aucun utilisateur trouvé.</div></Card>;
  }

  return (
    <Card className="glass-card">
      <div className="p-4">
        <h3 className="text-lg font-semibold text-foreground">Liste des utilisateurs</h3>
        <ul className="mt-4 space-y-2">
          {users.map(user => (
            <li key={user.id} className="flex items-center justify-between p-3 glass rounded-xl">
              <div>
                <p className="font-medium text-sm text-foreground">{user.first_name} {user.last_name}</p>
                <p className="text-xs text-foreground/70">@{user.username}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};