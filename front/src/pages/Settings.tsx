import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Bell, Moon, Palette, Save, User, Shield, Database } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleSave = () => {
    toast({
      title: "Paramètres sauvegardés",
      description: "Vos préférences ont été mises à jour avec succès.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <div className="glass rounded-full p-3">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Paramètres</h1>
              <p className="text-muted-foreground">Gérez vos préférences et paramètres</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appearance Settings */}
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Apparence
              </CardTitle>
              <CardDescription>
                Personnalisez l'apparence de votre interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme-selector" className="text-sm font-medium">
                  Thème de couleur
                </Label>
                <ThemeToggle />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode" className="text-sm font-medium">
                    Mode sombre automatique
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Suit les préférences système
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configurez vos préférences de notification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications" className="text-sm font-medium">
                    Notifications push
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Recevoir les alertes importantes
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-updates" className="text-sm font-medium">
                    Mises à jour par email
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Recevoir les nouvelles par email
                  </p>
                </div>
                <Switch
                  id="email-updates"
                  checked={emailUpdates}
                  onCheckedChange={setEmailUpdates}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data & Privacy */}
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Confidentialité
              </CardTitle>
              <CardDescription>
                Gérez vos données et votre confidentialité
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-sync" className="text-sm font-medium">
                    Synchronisation automatique
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Synchroniser les données automatiquement
                  </p>
                </div>
                <Switch
                  id="auto-sync"
                  checked={autoSync}
                  onCheckedChange={setAutoSync}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Database className="w-4 h-4 mr-2" />
                  Exporter mes données
                </Button>
                <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                  <Shield className="w-4 h-4 mr-2" />
                  Supprimer mon compte
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Profil
              </CardTitle>
              <CardDescription>
                Informations de votre compte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Nom</Label>
                <p className="text-sm text-muted-foreground">Marie Dupont</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-muted-foreground">marie.dupont@universite.fr</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium">Formation</Label>
                <p className="text-sm text-muted-foreground">Master 2 Informatique - Promo 2024</p>
              </div>
              <Button variant="outline" className="w-full">
                Modifier le profil
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="glass bg-primary/20 hover:bg-primary/30">
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder les modifications
          </Button>
        </div>
      </div>
    </div>
  );
}