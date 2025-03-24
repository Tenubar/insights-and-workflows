
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <img src="/ai-tool-logo.png" alt="AI Tool" className="h-8" />
    </div>
  );
}
