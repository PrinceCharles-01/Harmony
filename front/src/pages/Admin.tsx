import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SchoolConfigWizard } from "@/components/admin/SchoolConfigWizard";
import { AdminStats } from "@/components/admin/AdminStats";
import { UserManagement } from "@/components/admin/UserManagement";
import { GradeEntry } from "@/components/admin/GradeEntry";
import { ScheduleManager } from "@/components/admin/ScheduleManager";
import { SubjectManager } from "@/components/admin/SubjectManager";
import { ClassroomManager } from "@/components/admin/ClassroomManager";
import { ExamPlanner } from "@/components/admin/ExamPlanner";
import { ReportCards } from "@/components/admin/ReportCards";
import { AttendanceTracker } from "@/components/admin/AttendanceTracker";
import { Settings, Users, BarChart3, School, GraduationCap, Calendar, BookOpen, MapPin, FileText, ClipboardCheck, UserCheck } from "lucide-react";

export default function Admin() {
  const [activeSection, setActiveSection] = useState("dashboard");

  const adminSections = [
    { id: "dashboard", name: "Tableau de bord", icon: BarChart3 },
    { id: "config", name: "Configuration École", icon: School },
    { id: "grades", name: "Saisie des Notes", icon: GraduationCap },
    { id: "schedule", name: "Emplois du Temps", icon: Calendar },
    { id: "subjects", name: "Matières & UE", icon: BookOpen },
    { id: "classrooms", name: "Salles & Espaces", icon: MapPin },
    { id: "exams", name: "Planification Examens", icon: ClipboardCheck },
    { id: "reports", name: "Bulletins de Notes", icon: FileText },
    { id: "attendance", name: "Suivi Présences", icon: UserCheck },
    { id: "users", name: "Gestion Utilisateurs", icon: Users },
    { id: "settings", name: "Paramètres", icon: Settings },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <AdminStats />;
      case "config":
        return <SchoolConfigWizard />;
      case "grades":
        return <GradeEntry />;
      case "schedule":
        return <ScheduleManager />;
      case "subjects":
        return <SubjectManager />;
      case "classrooms":
        return <ClassroomManager />;
      case "exams":
        return <ExamPlanner />;
      case "reports":
        return <ReportCards />;
      case "attendance":
        return <AttendanceTracker />;
      case "users":
        return <UserManagement />;
      case "settings":
        return <div className="glass-card p-6"><h2>Paramètres généraux</h2></div>;
      default:
        return <AdminStats />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="glass-card mb-6 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Administration</h1>
              <p className="text-muted-foreground">Gestion de l'établissement scolaire</p>
            </div>
            <Badge variant="outline" className="glass">
              Super Admin
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="glass-card p-4">
              <h3 className="font-semibold mb-4">Navigation</h3>
              <nav className="space-y-2">
                {adminSections.map((section) => (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection(section.id)}
                  >
                    <section.icon className="w-4 h-4 mr-2" />
                    {section.name}
                  </Button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}