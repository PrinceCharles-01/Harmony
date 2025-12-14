import { useEffect, useState } from "react";

interface HarmonyLoaderProps {
  onComplete?: () => void;
  duration?: number;
}

export const HarmonyLoader = ({ onComplete, duration = 2000 }: HarmonyLoaderProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center glass backdrop-blur-3xl">
      <div className="text-center space-y-8">
        {/* Cercles d'animation artistique */}
        <div className="relative w-32 h-32 mx-auto">
          <div className="harmony-circle-outer absolute inset-0"></div>
          <div className="harmony-circle-middle absolute inset-4"></div>
          <div className="harmony-circle-inner absolute inset-8"></div>
          <div className="harmony-center absolute inset-12"></div>
        </div>
        
        {/* Points d'animation fluide */}
        <div className="harmony-dots">
          <div className="harmony-dot-smooth"></div>
          <div className="harmony-dot-smooth"></div>
          <div className="harmony-dot-smooth"></div>
          <div className="harmony-dot-smooth"></div>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-3xl font-bold harmony-gradient-text">Harmony</h2>
          <p className="text-foreground/70 text-sm font-medium">Chargement de votre tableau de bord...</p>
        </div>
        
        {/* Barre de progression artistique */}
        <div className="w-40 h-2 bg-background/30 rounded-full overflow-hidden backdrop-blur-sm border border-primary/20">
          <div 
            className="h-full harmony-progress-bar rounded-full"
            style={{
              animation: `harmony-progress ${duration / 1000}s cubic-bezier(0.4, 0, 0.2, 1) infinite`
            }}
          />
        </div>
      </div>
    </div>
  );
};