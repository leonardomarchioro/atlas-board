import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
}: FeatureCardProps) {
  return (
    <article className="group rounded-lg border bg-surface-low p-6 transition-all duration-200 ease-out hover:-translate-y-1 hover:border-primary/30">
      <div className="mb-4 flex items-center gap-4">
        <Icon className="size-8 text-primary" strokeWidth={1.75} aria-hidden />
        <h2 className="text-headline-md">{title}</h2>
      </div>
      <p className="text-body-md text-muted-foreground">{description}</p>
    </article>
  );
}
