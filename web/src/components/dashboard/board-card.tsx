import { ArrowUpRight, Clock3, LayoutDashboard, ListChecks, Users } from "lucide-react";
import Link from "next/link";
import { BoardAdminMenu } from "@/components/boards/board-admin-menu";
import { BoardMembers } from "@/components/boards/board-members";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import type { BoardSummary } from "@/features/boards/types/board.types";
import { formatExactDate, formatRelativeDate } from "@/lib/date";

const roleLabels = {
  ADMIN: "Administrador",
  COLLABORATOR: "Colaborador",
} as const;
export function BoardCard({ board }: { board: BoardSummary }) {
  const membersLabel = board.membersCount === 1 ? "1 membro" : `${board.membersCount} membros`;
  const tasksLabel =
    board.tasksCount === 0
      ? "Nenhuma tarefa"
      : board.tasksCount === 1
        ? "1 tarefa"
        : `${board.tasksCount} tarefas`;

  return (
    <Card className="group relative h-full bg-card/60 [--card-spacing:--spacing(5)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50">
      <Link
        href={`/boards/${board.id}`}
        className="absolute inset-0 z-10 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        aria-label={`Acessar board ${board.name}`}
      />
      <CardHeader className="relative grid-cols-[auto_1fr_auto] items-center gap-3">
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
        {board.role === "ADMIN" ? (
          <BoardAdminMenu board={board} />
        ) : (
          <ArrowUpRight
            className="size-4 text-muted-foreground transition-colors group-hover:text-primary"
            aria-hidden
          />
        )}
      </CardHeader>
      <CardContent className="relative min-h-28 flex-1">
        <h2 className="mb-1 text-headline-md font-bold transition-colors group-hover:text-primary">
          {board.name}
        </h2>
        <p className="line-clamp-2 min-h-10 text-body-sm text-muted-foreground">
          {board.description || "Este board ainda não possui uma descrição."}
        </p>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-3 text-label-sm text-muted-foreground">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <BoardMembers members={board.members} />
            <span
              className="flex items-center gap-1.5 text-label-sm text-muted-foreground"
              aria-label={`${board.membersCount} membros ativos`}
            >
              <Users className="size-3.5" aria-hidden />
              {membersLabel}
            </span>
          </div>
          <span className="flex items-center gap-1.5 text-label-sm text-muted-foreground">
            <ListChecks className="size-3.5" aria-hidden />
            {tasksLabel}
          </span>
        </div>
        <div
          className="flex items-center gap-2 border-t border-border/70 pt-3"
          title={`Atualizado em ${formatExactDate(board.updatedAt, { dateStyle: "long", timeStyle: "short" })}`}
          aria-label={`Atualizado em ${formatExactDate(board.updatedAt, { dateStyle: "long", timeStyle: "short" })}`}
        >
          <Clock3 className="size-3.5" aria-hidden />
          Atualizado {formatRelativeDate(board.updatedAt)}
        </div>
      </CardFooter>
    </Card>
  );
}
