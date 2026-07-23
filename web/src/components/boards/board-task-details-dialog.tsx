"use client";

import { CalendarClock, CheckSquare, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useTaskDetails } from "@/features/tasks/hooks/task-hooks";

const labels = { LOW: "Baixa", MEDIUM: "Média", HIGH: "Alta" } as const;

export function BoardTaskDetailsDialog({
  taskId,
  onClose,
}: {
  taskId: string | null;
  onClose: () => void;
}) {
  const query = useTaskDetails(taskId);
  return (
    <Dialog
      open={Boolean(taskId)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        {query.isPending ? (
          <div className="space-y-4" role="status">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : query.isError ? (
          <div role="alert" className="py-8 text-center">
            <DialogTitle>Não foi possível carregar a tarefa.</DialogTitle>
            <button
              type="button"
              className="mt-4 text-primary hover:underline"
              onClick={() => void query.refetch()}
            >
              Tentar novamente
            </button>
          </div>
        ) : query.data ? (
          <>
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={
                    query.data.priority === "HIGH"
                      ? "destructive"
                      : query.data.priority === "MEDIUM"
                        ? "warning"
                        : "secondary"
                  }
                >
                  {labels[query.data.priority]}
                </Badge>
                {query.data.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline">
                    {tag.name}
                  </Badge>
                ))}
              </div>
              <DialogTitle className="text-headline-md">{query.data.title}</DialogTitle>
              <DialogDescription>
                {query.data.description || "Esta tarefa não possui descrição."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-surface-low p-4">
                <p className="flex items-center gap-2 font-label text-label-sm uppercase text-muted-foreground">
                  <UserRound className="size-4" aria-hidden />
                  Responsável
                </p>
                <p className="mt-1">{query.data.assignee?.name || "Sem responsável"}</p>
              </div>
              <div className="rounded-lg border bg-surface-low p-4">
                <p className="flex items-center gap-2 font-label text-label-sm uppercase text-muted-foreground">
                  <CalendarClock className="size-4" aria-hidden />
                  Prazo
                </p>
                <p className="mt-1">
                  {query.data.dueDate
                    ? new Date(query.data.dueDate).toLocaleString("pt-BR", {
                        dateStyle: "long",
                        timeStyle: "short",
                      })
                    : "Sem prazo"}
                </p>
              </div>
            </div>
            <section>
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <CheckSquare className="size-4" aria-hidden />
                Checklist ({query.data.checklistProgress.completed}/
                {query.data.checklistProgress.total})
              </h3>
              {query.data.checklist.length ? (
                <ul className="space-y-2">
                  {query.data.checklist.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-2 rounded-md border p-3 text-body-sm"
                    >
                      <span aria-hidden>{item.isCompleted ? "✓" : "○"}</span>
                      <span
                        className={item.isCompleted ? "text-muted-foreground line-through" : ""}
                      >
                        {item.title}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-body-sm text-muted-foreground">Nenhum item de checklist.</p>
              )}
            </section>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
