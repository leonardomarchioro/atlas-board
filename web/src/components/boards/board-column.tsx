"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { MoreHorizontal, Plus } from "lucide-react";
import { BoardTaskCard } from "@/components/boards/board-task-card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { BoardColumn as BoardColumnType } from "@/features/boards/types/board.types";
import type { BoardTask } from "@/features/tasks/types/task.types";
import { cn } from "@/lib/utils";

export function BoardColumn({
  column,
  tasks,
  totalTasks,
  isAdmin,
  dragDisabled,
  onAddTask,
  onOpenTask,
}: {
  column: BoardColumnType;
  tasks: BoardTask[];
  totalTasks: number;
  isAdmin: boolean;
  dragDisabled: boolean;
  onAddTask: (columnId: string) => void;
  onOpenTask: (taskId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", columnId: column.id },
  });
  return (
    <section className="flex h-full w-80 shrink-0 flex-col" aria-labelledby={`column-${column.id}`}>
      <header className="mb-3 flex h-10 items-center justify-between gap-2 px-1">
        <div className="flex min-w-0 items-center gap-2">
          <h2
            id={`column-${column.id}`}
            className="truncate font-label text-label-md font-semibold"
          >
            {column.name}
          </h2>
          <span
            className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground"
            aria-label={`${tasks.length} tarefas visíveis`}
          >
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onAddTask(column.id)}
            aria-label={`Adicionar tarefa em ${column.name}`}
          >
            <Plus aria-hidden />
          </Button>
        </div>
      </header>
      <div
        ref={setNodeRef}
        className={cn(
          "min-h-40 flex-1 space-y-3 overflow-y-auto rounded-xl border border-transparent bg-surface-low/50 p-2 transition-colors",
          isOver && "border-primary bg-primary/5",
        )}
        aria-label={`Área de tarefas de ${column.name}`}
      >
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <BoardTaskCard key={task.id} task={task} onOpen={onOpenTask} disabled={dragDisabled} />
          ))}
        </SortableContext>
        {tasks.length === 0 ? (
          <div className="grid min-h-32 place-items-center rounded-lg border border-dashed p-4 text-center text-body-sm text-muted-foreground">
            <div>
              <p>
                {totalTasks > 0
                  ? "Nenhuma tarefa corresponde aos filtros."
                  : "Nenhuma tarefa nesta coluna."}
              </p>
              <button
                type="button"
                onClick={() => onAddTask(column.id)}
                className="mt-2 font-label text-primary hover:underline"
              >
                Adicionar tarefa
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
