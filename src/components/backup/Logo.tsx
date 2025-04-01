
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  const { theme } = useTheme();

  return (
    <div className={cn("flex items-center", className)}>
      <img 
        src="/ai-tool-logo.png" 
        alt="AI Tool" 
        className="h-8"
        style={{ filter: theme === 'dark' ? 'brightness(1.2)' : 'none' }} 
      />
    </div>
  );
}
