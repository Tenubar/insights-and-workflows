
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleTheme}
      className={cn(
        "rounded-full w-10 h-10 border-0 transition-all duration-300",
        theme === "dark" 
          ? "bg-gray-800 text-yellow-400 hover:bg-gray-700 hover:text-yellow-300" 
          : "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
      )}
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="h-[1.2rem] w-[1.2rem] transition-transform rotate-0 scale-100" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-transform rotate-90 scale-100" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
