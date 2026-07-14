import { Layers3 } from "lucide-react";

import { cn } from "@/lib/utils";

interface BrandMarkProps {
  size?: "default" | "sm";
  className?: string;
}

export function BrandMark({
  size = "default",
  className,
}: BrandMarkProps) {
  const isSmall = size === "sm";

  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "grid place-items-center rounded-md bg-primary text-primary-foreground",
          isSmall ? "size-8" : "size-10",
        )}
      >
        <Layers3 className={isSmall ? "size-4" : "size-5"} aria-hidden />
      </span>
      <span className={cn("font-bold tracking-tight", isSmall ? "text-body-md" : "text-headline-md")}>
        Atlas
      </span>
    </span>
  );
}
