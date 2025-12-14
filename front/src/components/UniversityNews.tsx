import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ExternalLink, Pin, Heart, MessageCircle, Share2, Instagram, Twitter, Facebook, Users } from "lucide-react";

interface UniversityNewsProps {
  showAll?: boolean;
}

export const UniversityNews = ({ showAll = false }: UniversityNewsProps) => {
  const news = [
    {
      title: "Nouvelle procédure d'inscription aux stages",
      summary: "À partir du 1er février, les étudiants devront utiliser la nouvelle plateforme en ligne pour leurs demandes de stage.",
      date: "2024-01-15",
      category: "Important",
      priority: "high",
      link: "#"
    },
    {
      title: "Conférence IA et Éthique - 25 janvier",
      summary: "Conférence exceptionnelle sur l'intelligence artificielle et l'éthique animée par des experts du domaine.",
      date: "2024-01-12",
      category: "Événement",
      priority: "medium",
      link: "#"
    },
    {
      title: "Fermeture bibliothèque - Travaux",
      summary: "La bibliothèque universitaire sera fermée du 20 au 22 janvier pour travaux de rénovation.",
      date: "2024-01-10",
      category: "Info",
      priority: "medium",
      link: "#"
    },
    {
      title: "Ouverture candidatures Master 2",
      summary: "Les candidatures pour les Masters 2 de la rentrée prochaine sont maintenant ouvertes sur le portail étudiant.",
      date: "2024-01-08",
      category: "Inscription",
      priority: "low",
      link: "#"
    },
    {
      title: "Nouveau partenariat entreprise",
      summary: "L'université annonce un nouveau partenariat avec TechCorp pour des opportunités de stages et d'emplois.",
      date: "2024-01-05",
      category: "Partenariat",
      priority: "low",
      link: "#"
    }
  ];

  const displayedNews = showAll ? news : news.slice(0, 3);

  const socialPosts = [
    {
      author: "Université Sorbonne",
      timestamp: "Il y a 2h",
      content: "🎓 Félicitations à tous nos diplômés ! La cérémonie de remise des diplômes aura lieu vendredi dans l'amphithéâtre principal. #Promotion2024 #Réussite",
      likes: 42,
      comments: 8,
      shares: 12,
      isLiked: true,
      image: true,
      icon: Instagram
    },
    {
      author: "Campus Life",
      timestamp: "Il y a 4h",
      content: "🏀 Match de basket universitaire ce soir ! Venez supporter votre équipe à 19h30 au gymnase. L'entrée est gratuite pour tous les étudiants.",
      likes: 28,
      comments: 15,
      shares: 6,
      isLiked: false,
      image: false,
      icon: Twitter
    },
    {
      author: "Bibliothèque Universitaire",
      timestamp: "Il y a 6h",
      content: "📚 Nouveaux espaces de travail collaboratif disponibles au 3ème étage ! Réservation en ligne sur notre site web. Parfait pour vos projets de groupe.",
      likes: 19,
      comments: 4,
      shares: 3,
      isLiked: false,
      image: true,
      icon: Facebook
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Important":
        return "bg-red-100 text-red-800 border-red-200";
      case "Événement":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Info":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Inscription":
        return "bg-green-100 text-green-800 border-green-200";
      case "Partenariat":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleInteraction = (postIndex: number, type: 'like' | 'comment' | 'share') => {
    // Handle social media interactions
    // TODO: Implement actual social media interaction logic
  };

  return (
    <Card className="glass-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Vie universitaire</h3>
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">2.4k abonnés</span>
        </div>
      </div>

      <Tabs defaultValue="actualites" className="w-full">
        <TabsList className="grid w-full grid-cols-2 glass">
          <TabsTrigger value="actualites" className="text-xs">Actualités</TabsTrigger>
          <TabsTrigger value="social" className="text-xs">Social</TabsTrigger>
        </TabsList>
        
        <TabsContent value="actualites" className="space-y-4 mt-4">
          {displayedNews.map((item, index) => (
            <div
              key={index}
              className="p-4 glass rounded-xl hover:bg-accent/10 transition-colors group cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {item.priority === "high" && (
                      <Pin className="w-4 h-4 text-red-500" />
                    )}
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getCategoryColor(item.category)}`}
                    >
                      {item.category}
                    </Badge>
                  </div>
                  
                  <h4 className="font-medium text-sm mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {item.summary}
                  </p>
                  
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(item.date)}</span>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="w-3 h-3" />
                      <span>Lire plus</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {showAll && (
            <div className="mt-6 text-center">
              <Badge variant="outline" className="glass">
                Toutes les actualités
              </Badge>
            </div>
          )}
        </TabsContent>

        <TabsContent value="social" className="space-y-4 mt-4">
          {socialPosts.map((post, index) => (
            <div
              key={index}
              className="p-4 glass rounded-xl hover:bg-accent/10 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 glass rounded-full flex items-center justify-center">
                    <post.icon className="w-4 h-4 text-primary" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium">{post.author}</span>
                    <span className="text-xs text-muted-foreground">{post.timestamp}</span>
                  </div>
                  
                  <p className="text-sm mb-3 leading-relaxed">{post.content}</p>
                  
                  {post.image && (
                    <div className="mb-3">
                      <div className="w-full h-32 glass rounded-lg flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">📷 Photo</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`h-8 px-3 text-xs ${post.isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
                      onClick={() => handleInteraction(index, 'like')}
                    >
                      <Heart className={`w-3 h-3 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                      {post.likes}
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-3 text-xs text-muted-foreground"
                      onClick={() => handleInteraction(index, 'comment')}
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      {post.comments}
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-3 text-xs text-muted-foreground"
                      onClick={() => handleInteraction(index, 'share')}
                    >
                      <Share2 className="w-3 h-3 mr-1" />
                      {post.shares}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </Card>
  );
};