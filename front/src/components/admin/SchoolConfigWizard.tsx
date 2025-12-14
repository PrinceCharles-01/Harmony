import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft, Check, School, Users, Settings } from "lucide-react";
import { toast } from "sonner";

export const SchoolConfigWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState({
    // Étape 1: Informations générales
    schoolName: "",
    schoolType: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    
    // Étape 2: Configuration académique
    isUniversity: false,
    lmdSystem: false,
    academicYears: [],
    departments: [],
    
    // Étape 3: Effectifs et personnel
    studentCount: 0,
    teacherCount: 0,
    adminCount: 0,
    totalCapacity: 0,
    
    // Étape 4: Rôles et permissions
    roles: [],
    customRoles: "",
  });

  const steps = [
    {
      title: "Informations générales",
      description: "Nom et coordonnées de l'établissement",
      icon: School
    },
    {
      title: "Configuration académique", 
      description: "Structure pédagogique et programmes",
      icon: Users
    },
    {
      title: "Effectifs",
      description: "Nombre d'étudiants et personnel",
      icon: Users
    },
    {
      title: "Rôles et permissions",
      description: "Configuration des accès",
      icon: Settings
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schoolName" className="text-sm font-medium">Nom de l'établissement *</Label>
                <Input
                  id="schoolName"
                  value={config.schoolName}
                  onChange={(e) => handleInputChange("schoolName", e.target.value)}
                  placeholder="Ex: Université de la Sorbonne, Lycée Jean Monnet..."
                  className="glass-input transition-all duration-200 focus:scale-[1.02]"
                />
                <p className="text-xs text-muted-foreground">Le nom officiel complet de votre établissement</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="schoolType" className="text-sm font-medium">Type d'établissement *</Label>
                <Select value={config.schoolType} onValueChange={(value) => handleInputChange("schoolType", value)}>
                  <SelectTrigger className="glass-input transition-all duration-200 focus:scale-[1.02]">
                    <SelectValue placeholder="Sélectionnez le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="college">Collège</SelectItem>
                    <SelectItem value="lycee">Lycée</SelectItem>
                    <SelectItem value="universite">Université</SelectItem>
                    <SelectItem value="grande-ecole">Grande École</SelectItem>
                    <SelectItem value="iut">IUT/BTS</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Catégorie principale de votre établissement</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">Adresse complète</Label>
              <Textarea
                id="address"
                value={config.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="123 Rue de l'Université&#10;75005 Paris&#10;France"
                className="glass-input transition-all duration-200 focus:scale-[1.01]"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">Adresse postale complète de l'établissement</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={config.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="01 23 45 67 89"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={config.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="contact@universite.fr"
                />
              </div>
              <div>
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  value={config.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://www.universite.fr"
                />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isUniversity"
                checked={config.isUniversity}
                onCheckedChange={(checked) => handleInputChange("isUniversity", checked)}
              />
              <Label htmlFor="isUniversity">Cet établissement est une université</Label>
            </div>
            
            {config.isUniversity && (
              <div className="ml-6 space-y-4 p-4 glass rounded-lg">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lmdSystem"
                    checked={config.lmdSystem}
                    onCheckedChange={(checked) => handleInputChange("lmdSystem", checked)}
                  />
                  <Label htmlFor="lmdSystem">Système LMD (Licence, Master, Doctorat)</Label>
                </div>
                
                <div>
                  <Label>Départements/Facultés</Label>
                  <Textarea
                    placeholder="Ex: Informatique, Mathématiques, Lettres, Sciences Économiques..."
                    className="mt-1"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Un département par ligne</p>
                </div>
                
                <div>
                  <Label>Programmes disponibles</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {["Licence", "Master", "Doctorat", "DUT", "BTS", "Prépa"].map((program) => (
                      <div key={program} className="flex items-center space-x-2">
                        <Checkbox id={program} />
                        <Label htmlFor={program} className="text-sm">{program}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="studentCount">Nombre d'étudiants</Label>
                <Input
                  id="studentCount"
                  type="number"
                  value={config.studentCount}
                  onChange={(e) => handleInputChange("studentCount", parseInt(e.target.value) || 0)}
                  placeholder="1500"
                />
              </div>
              <div>
                <Label htmlFor="teacherCount">Enseignants</Label>
                <Input
                  id="teacherCount"
                  type="number"
                  value={config.teacherCount}
                  onChange={(e) => handleInputChange("teacherCount", parseInt(e.target.value) || 0)}
                  placeholder="120"
                />
              </div>
              <div>
                <Label htmlFor="adminCount">Personnel administratif</Label>
                <Input
                  id="adminCount"
                  type="number"
                  value={config.adminCount}
                  onChange={(e) => handleInputChange("adminCount", parseInt(e.target.value) || 0)}
                  placeholder="50"
                />
              </div>
              <div>
                <Label htmlFor="totalCapacity">Capacité totale</Label>
                <Input
                  id="totalCapacity"
                  type="number"
                  value={config.totalCapacity}
                  onChange={(e) => handleInputChange("totalCapacity", parseInt(e.target.value) || 0)}
                  placeholder="2000"
                />
              </div>
            </div>
            
            <div className="glass p-4 rounded-lg">
              <h4 className="font-medium mb-2">Répartition actuelle</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Étudiants:</span>
                  <span className="font-medium">{config.studentCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Personnel total:</span>
                  <span className="font-medium">{config.teacherCount + config.adminCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taux d'occupation:</span>
                  <span className="font-medium">
                    {config.totalCapacity > 0 ? Math.round((config.studentCount / config.totalCapacity) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label>Rôles prédéfinis</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  "Super Administrateur",
                  "Directeur",
                  "Secrétaire",
                  "Enseignant",
                  "Surveillant",
                  "Étudiant"
                ].map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox id={role} defaultChecked />
                    <Label htmlFor={role} className="text-sm">{role}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="customRoles">Rôles personnalisés</Label>
              <Textarea
                id="customRoles"
                value={config.customRoles}
                onChange={(e) => handleInputChange("customRoles", e.target.value)}
                placeholder="Ajoutez des rôles spécifiques à votre établissement, un par ligne"
                rows={4}
              />
            </div>
            
            <div className="glass p-4 rounded-lg">
              <h4 className="font-medium mb-2">Permissions par défaut</h4>
              <p className="text-sm text-muted-foreground">
                Les permissions seront configurées automatiquement selon les rôles sélectionnés. 
                Vous pourrez les personnaliser après la configuration initiale.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="glass-card p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Configuration de l'établissement</h2>
        <p className="text-muted-foreground">
          Configurez les paramètres de base de votre établissement en 4 étapes
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Étape {currentStep + 1} sur {steps.length}</span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step indicator */}
      <div className="flex justify-between mb-6">
        {steps.map((step, index) => (
          <div key={index} className={`flex flex-col items-center flex-1 ${index <= currentStep ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
              index < currentStep ? 'bg-primary text-primary-foreground' :
              index === currentStep ? 'bg-primary/20 text-primary' : 'bg-muted'
            }`}>
              {index < currentStep ? <Check className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
            </div>
            <div className="text-center">
              <div className="text-xs font-medium">{step.title}</div>
              <div className="text-xs text-muted-foreground hidden md:block">{step.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="mb-6 min-h-[300px]">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Précédent
        </Button>

        {currentStep === steps.length - 1 ? (
          <Button onClick={() => {
            // TODO: Implement configuration save logic
            toast.success("Configuration enregistrée avec succès!");
          }}>
            <Check className="w-4 h-4 mr-2" />
            Terminer la configuration
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Suivant
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </Card>
  );
};