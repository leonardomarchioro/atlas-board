import { ArrowUpRight, Clock3, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import type { BoardSummary } from "@/features/boards/types/board.types";

const roleLabels = {
  ADMIN: "Administrador",
  COLLABORATOR: "Colaborador",
} as const;
function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function BoardCard({ board }: { board: BoardSummary }) {
  return (
    <Link
      href={"/boards/" + board.id}
      className="group rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      aria-label={"Acessar board " + board.name}
    >
      <Card className="h-full bg-card/60 [--card-spacing:--spacing(5)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50">
        <CardHeader className="grid-cols-[auto_1fr_auto] items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
            <LayoutDashboard aria-hidden />
          </span>
          <Badge
            variant={board.role === "ADMIN" ? "info" : "secondary"}
            className="h-7 justify-self-start px-3 py-1 normal-case"
            title={roleLabels[board.role]}
          >
            {roleLabels[board.role]}
          </Badge>
          <ArrowUpRight
            className="size-4 text-muted-foreground transition-colors group-hover:text-primary"
            aria-hidden
          />
        </CardHeader>
        <CardContent className="min-h-28">
          <h2 className="mb-1 text-headline-md font-bold transition-colors group-hover:text-primary">
            {board.name}
          </h2>
          <p className="line-clamp-2 text-body-sm text-muted-foreground">
            {board.description || "Este board ainda não possui uma descrição."}
          </p>
        </CardContent>
        <CardFooter className="gap-2 text-label-sm text-muted-foreground">
          <Clock3 className="size-3.5" aria-hidden />
          Atualizado em {formatUpdatedAt(board.updatedAt)}
        </CardFooter>
      </Card>
    </Link>
  );
}
