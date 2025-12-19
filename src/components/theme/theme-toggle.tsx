"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      className="h-10 w-10 rounded-full p-0 text-foreground hover:bg-accent hover:text-accent-foreground transition-transform active:scale-95"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
};
