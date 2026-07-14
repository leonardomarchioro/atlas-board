import { Circle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusTone = "default" | "success" | "warning" | "info" | "destructive";

interface StatusBadgeProps {
  children: React.ReactNode;
  tone?: StatusTone;
  live?: boolean;
  className?: string;
}

const toneClasses: Record<StatusTone, string> = {
  default: "bg-accent text-accent-foreground",
  success: "bg-success-soft text-success-foreground",
  warning: "bg-warning-soft text-warning-foreground",
  info: "bg-info-soft text-info-foreground",
  destructive: "bg-destructive/10 text-destructive dark:bg-destructive/20",
};

export function StatusBadge({
  children,
  tone = "default",
  live = false,
  className,
}: StatusBadgeProps) {
  return (
    <Badge className={cn(toneClasses[tone], className)}>
      <Circle
        className={cn("size-2! fill-current", live && "animate-status-pulse")}
        aria-hidden="true"
      />
      {children}
      {live && <span className="sr-only">atualização em tempo real</span>}
    </Badge>
  );
}
