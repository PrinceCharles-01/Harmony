import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const themes = [
  { value: "light", label: "Clair", color: "hsl(320, 60%, 70%)" },
  { value: "dark", label: "Sombre", color: "hsl(280, 65%, 60%)" },
  { value: "strawberry", label: "Fraise Sombre", color: "hsl(340, 85%, 65%)" },
  { value: "blue-light", label: "Bleu Clair", color: "hsl(220, 75%, 55%)" },
  { value: "blue-night", label: "Bleu Nuit", color: "hsl(220, 90%, 70%)" },
];

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="glass-card">
        <div className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="glass-card hover:bg-primary/10 transition-all duration-300"
        >
          <Palette className="w-5 h-5 text-primary transition-all duration-300" />
          <span className="sr-only">Changer le thème</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-card border-border/50">
        {themes.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption.value}
            onClick={() => setTheme(themeOption.value)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div
              className="w-4 h-4 rounded-full border border-border/30"
              style={{ backgroundColor: themeOption.color }}
            />
            {themeOption.label}
            {theme === themeOption.value && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};