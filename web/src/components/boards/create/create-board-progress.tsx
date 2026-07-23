import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = ["Info", "Colunas", "Membros", "Revisão"] as const;

export function CreateBoardProgress({ currentStep }: { currentStep: number }) {
  return (
    <nav aria-label="Progresso da criação do board">
      <ol className="relative flex items-start justify-between">
        <span className="absolute top-4 right-4 left-4 h-0.5 bg-border" aria-hidden />
        <span
          className="absolute top-4 left-4 h-0.5 bg-primary transition-[width] duration-300"
          style={{ width: `calc(${(currentStep / (steps.length - 1)) * 100}% - 2rem)` }}
          aria-hidden
        />
        {steps.map((label, index) => {
          const complete = index < currentStep;
          const active = index === currentStep;
          return (
            <li
              key={label}
              className="relative z-10 flex min-w-14 flex-col items-center gap-2"
              aria-current={active ? "step" : undefined}
            >
              <span
                className={cn(
                  "grid size-8 place-items-center rounded-full border bg-card font-label text-label-sm",
                  complete && "border-primary bg-primary text-primary-foreground",
                  active &&
                    "border-primary bg-primary text-primary-foreground ring-4 ring-primary/10",
                  !complete && !active && "text-muted-foreground",
                )}
              >
                {complete ? <Check className="size-4" aria-hidden /> : index + 1}
              </span>
              <span
                className={cn(
                  "font-label text-label-sm text-muted-foreground",
                  active && "text-primary",
                )}
              >
                {label}
                {active ? <span className="sr-only">, etapa atual</span> : null}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
