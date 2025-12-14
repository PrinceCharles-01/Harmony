import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, X, AlertCircle, Calendar, BookOpen, Trophy } from "lucide-react";

interface Notification {
  id: string;
  type: 'grade' | 'schedule' | 'announcement' | 'achievement';
  title: string;
  message: string;
  time: string;
  read: boolean;
  urgent?: boolean;
}

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'grade',
      title: 'Nouvelle note disponible',
      message: 'Note de Projet IA : 18/20',
      time: 'Il y a 2h',
      read: false,
      urgent: false
    },
    {
      id: '2',
      type: 'schedule',
      title: 'Changement d\'horaire',
      message: 'Cours de BD déplacé à 14h30',
      time: 'Il y a 4h',
      read: false,
      urgent: true
    },
    {
      id: '3',
      type: 'achievement',
      title: 'Félicitations !',
      message: 'Vous êtes dans le top 10 de votre promotion',
      time: 'Hier',
      read: true,
      urgent: false
    },
    {
      id: '4',
      type: 'announcement',
      title: 'Nouvel événement',
      message: 'Conférence sur l\'IA le 25 janvier',
      time: 'Il y a 1 jour',
      read: true,
      urgent: false
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'grade': return BookOpen;
      case 'schedule': return Calendar;
      case 'achievement': return Trophy;
      case 'announcement': return AlertCircle;
      default: return Bell;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'grade': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'schedule': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'achievement': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'announcement': return 'bg-violet-500/10 text-violet-600 border-violet-500/20';
      default: return 'bg-muted text-foreground';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="glass-card relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0 glass-card border-0" align="end">
        <div className="p-4 border-b border-border/20">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs"
              >
                Tout marquer comme lu
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-96">
          <div className="p-2">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Aucune notification</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = getIcon(notification.type);
                return (
                  <Card 
                    key={notification.id}
                    className={`p-3 mb-2 cursor-pointer transition-all hover:bg-accent/10 ${
                      !notification.read ? 'bg-primary/5 border-primary/20' : 'bg-transparent'
                    } ${notification.urgent ? 'border-l-4 border-l-destructive' : ''}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">{notification.title}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 opacity-60 hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{notification.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{notification.time}</span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};