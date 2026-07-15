import { FileText, LayoutDashboard, ShieldCheck, UsersRound, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { BoardSummary } from "@/features/boards/types/board.types";

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <Card className="bg-card/60 py-0 backdrop-blur">
      <CardContent className="flex items-end justify-between p-4">
        <div className="space-y-1">
          <p className="font-label text-label-sm uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="text-headline-md font-bold">{value}</p>
        </div>
        <Icon className="size-5 text-primary" aria-hidden />
      </CardContent>
    </Card>
  );
}

export function DashboardSummary({ boards }: { boards: BoardSummary[] }) {
  const metrics = [
    { label: "Total de boards", value: boards.length, icon: LayoutDashboard },
    {
      label: "Administrados",
      value: boards.filter((board) => board.role === "ADMIN").length,
      icon: ShieldCheck,
    },
    {
      label: "Compartilhados",
      value: boards.filter((board) => board.role === "COLLABORATOR").length,
      icon: UsersRound,
    },
    {
      label: "Com descrição",
      value: boards.filter((board) => Boolean(board.description?.trim())).length,
      icon: FileText,
    },
  ];
  return (
    <section
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      aria-label="Resumo dos boards"
    >
      {metrics.map((metric) => (
        <SummaryCard key={metric.label} {...metric} />
      ))}
    </section>
  );
}
