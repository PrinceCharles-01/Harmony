import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Calendar, 
  GraduationCap, 
  User, 
  Bell,
  LogOut,
  Home,
  BarChart3,
  Clock,
  Info,
  Settings,
  List
} from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { QuickStats } from "@/components/QuickStats";
import { RecentGrades } from "@/components/RecentGrades";
import { UpcomingSchedule } from "@/components/UpcomingSchedule";
import { UniversityNews } from "@/components/UniversityNews";
import { GradesChart } from "@/components/GradesChart";
import { FullCalendarView } from "@/components/FullCalendarView";

// ... (le reste des imports)

const fetchSchedule = async (): Promise<any[]> => {
  const response = await fetch("/api/academics/schedule/");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

const Dashboard = () => {
  // ... (le reste du composant)

  const { data: scheduleData, isLoading: isLoadingSchedule } = useQuery({
    queryKey: ["schedule"],
    queryFn: fetchSchedule,
  });

  const calendarEvents = scheduleData?.map(item => ({
    title: item.subject,
    start: new Date(item.date + 'T' + item.time.split(' - ')[0]),
    end: new Date(item.date + 'T' + item.time.split(' - ')[1]),
    extendedProps: {
      professor: item.professor,
      room: item.room,
      ue: item.ue,
      type: item.type,
    },
    backgroundColor: item.color.replace('bg-', '--').replace('-500', ''), // Adapter les couleurs
    borderColor: item.color.replace('bg-', '--').replace('-500', ''),
  })) || [];

  const renderContent = () => {
    switch (activeSection) {
      // ... (les autres cas)
      case "schedule":
        return (
          <div className="space-y-6">
            <SearchFilter 
              onSearch={setSearchQuery} 
              onFilter={setFilters}
              placeholder="Rechercher dans le planning..."
              type="schedule"
            />
            {isLoadingSchedule ? <HarmonyLoader /> : <FullCalendarView events={calendarEvents} />}
            <UpcomingSchedule showAll />
          </div>
        );
      // ... (le reste des cas)
    }
  };

  // ... (le reste du composant)
};

export default Dashboard;