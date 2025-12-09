 "use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./theme-provider";

export const ThemeToggle = () => {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
      className="h-10 w-10 rounded-full p-0 text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
};

