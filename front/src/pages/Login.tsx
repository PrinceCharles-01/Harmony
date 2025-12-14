import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { BookOpen, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulation d'une connexion réussie
    toast({
      title: "Connexion réussie",
      description: "Bienvenue dans votre espace étudiant !",
    });
    
    navigate("/dashboard");
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Email envoyé",
      description: "Un email de réinitialisation a été envoyé à votre adresse.",
    });
    
    setForgotPassword(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo et titre */}
        <div className="text-center space-y-4">
          <div className="glass-card mx-auto w-20 h-20 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">UniSpace</h1>
            <p className="text-muted-foreground mt-2">Votre espace étudiant personnel</p>
          </div>
        </div>

        {/* Formulaire de connexion */}
        <Card className="glass-card space-y-6">
          {!forgotPassword ? (
            <>
              <div className="space-y-2 text-center">
                <h2 className="text-xl font-semibold text-foreground">Connexion</h2>
                <p className="text-sm text-muted-foreground">Accédez à votre compte étudiant</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email universitaire</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="prenom.nom@universite.fr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 glass-input"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 glass-input"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full btn-glass bg-primary text-primary-foreground hover:bg-primary/90">
                  Se connecter
                </Button>
              </form>

              <div className="text-center">
                <button
                  onClick={() => setForgotPassword(true)}
                  className="text-sm text-primary hover:underline transition-colors"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2 text-center">
                <h2 className="text-xl font-semibold text-foreground">Mot de passe oublié</h2>
                <p className="text-sm text-muted-foreground">
                  Entrez votre email pour recevoir un lien de réinitialisation
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email universitaire</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="prenom.nom@universite.fr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 glass-input"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setForgotPassword(false)}
                    className="flex-1 glass-input"
                  >
                    Retour
                  </Button>
                  <Button type="submit" className="flex-1 btn-glass bg-primary text-primary-foreground hover:bg-primary/90">
                    Envoyer
                  </Button>
                </div>
              </form>
            </>
          )}
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>© 2024 UniSpace - Votre université connectée</p>
        </div>
      </div>
    </div>
  );
};

export default Login;