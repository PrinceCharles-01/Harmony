import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NotificationCenter } from "./NotificationCenter";
import { ThemeToggle } from "./ThemeToggle";

export const DashboardHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <header className="glass-card m-4 mb-0 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="glass rounded-full p-3">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-2xl font-bold gradient-text">Bonjour, Marie !</h1>
            <p className="text-muted-foreground">Master 2 Informatique - Promo 2024</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Notifications */}
          <NotificationCenter />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Admin Panel */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/admin")}
            className="glass-card text-muted-foreground hover:text-primary"
            title="Administration"
          >
            <SettingsIcon className="w-5 h-5" />
          </Button>

          {/* Profil */}
          <div className="hidden sm:flex items-center space-x-3 glass-card px-4 py-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="bg-primary/10 text-primary">MD</AvatarFallback>
            </Avatar>
            <span className="font-medium">Marie Dupont</span>
          </div>

          {/* Déconnexion */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            className="glass-card text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};