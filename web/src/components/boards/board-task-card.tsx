"use client";

/* eslint-disable react-hooks/refs -- dnd-kit exposes refs, attributes and listeners through useSortable for render-time binding. */

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarClock, CheckSquare, GripVertical, MessageCircle } from "lucide-react";
import type { CSSProperties } from "react";
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { BoardTask, TaskPriority, TaskTag } from "@/features/tasks/types/task.types";
import { cn } from "@/lib/utils";

const priority: Record<
  TaskPriority,
  { label: string; variant: "secondary" | "warning" | "destructive" }
> = {
  LOW: { label: "Baixa", variant: "secondary" },
  MEDIUM: { label: "Média", variant: "warning" },
  HIGH: { label: "Alta", variant: "destructive" },
};
const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
function safeColor(tag: TaskTag) {
  return /^#[0-9a-f]{6}$/i.test(tag.color) ? tag.color : "#64748b";
}

export function BoardTaskCard({
  task,
  onOpen,
  disabled = false,
  overlay = false,
}: {
  task: BoardTask;
  onOpen: (taskId: string) => void;
  disabled?: boolean;
  overlay?: boolean;
}) {
  const sortable = useSortable({
    id: task.id,
    disabled: disabled || overlay,
    data: { type: "task", task },
  });
  const due = task.dueDate ? new Date(task.dueDate) : null;
  // Atraso é, por definição, dependente do relógio no momento da renderização.
  // eslint-disable-next-line react-hooks/purity
  const overdue = due ? due.getTime() < Date.now() : false;
  const style: CSSProperties = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };
  return (
    <article
      ref={sortable.setNodeRef}
      style={style}
      className={cn(
        "relative rounded-xl border bg-card p-4 shadow-sm transition-colors hover:border-primary/50",
        sortable.isDragging && "z-20 opacity-40",
        overlay && "rotate-2 border-primary shadow-overlay",
      )}
    >
      <button
        type="button"
        ref={sortable.setActivatorNodeRef}
        {...sortable.attributes}
        {...sortable.listeners}
        onClick={() => !sortable.isDragging && onOpen(task.id)}
        className={cn(
          "w-full text-left",
          disabled ? "cursor-pointer" : "cursor-grab active:cursor-grabbing",
        )}
        aria-label={`Abrir tarefa ${task.title}`}
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap gap-1.5">
            {task.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                style={{ "--tag-color": safeColor(tag) } as CSSProperties}
                className="max-w-28 truncate rounded bg-[color-mix(in_oklch,var(--tag-color)_18%,transparent)] px-1.5 py-0.5 font-label text-[10px] font-bold uppercase tracking-wider text-[var(--tag-color)]"
              >
                {tag.name}
              </span>
            ))}
          </div>
          <GripVertical className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </div>
        <h3 className="font-semibold leading-snug text-card-foreground">{task.title}</h3>
        {task.description ? (
          <p className="mt-2 line-clamp-2 text-body-sm text-muted-foreground">{task.description}</p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant={priority[task.priority].variant}>{priority[task.priority].label}</Badge>
          {due ? (
            <span
              className={cn(
                "flex items-center gap-1 text-label-sm",
                overdue ? "font-semibold text-destructive" : "text-muted-foreground",
              )}
            >
              <CalendarClock className="size-3.5" aria-hidden />
              {due.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
              {overdue ? <span className="sr-only">, atrasada</span> : null}
            </span>
          ) : null}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-label-sm text-muted-foreground">
            {task.commentsCount ? (
              <span
                className="flex items-center gap-1"
                aria-label={`${task.commentsCount} comentários`}
              >
                <MessageCircle className="size-3.5" aria-hidden />
                {task.commentsCount}
              </span>
            ) : null}
            {task.checklistCount ? (
              <span
                className="flex items-center gap-1"
                aria-label={`${task.completedChecklistCount} de ${task.checklistCount} itens concluídos`}
              >
                <CheckSquare className="size-3.5" aria-hidden />
                {task.completedChecklistCount}/{task.checklistCount}
              </span>
            ) : null}
          </div>
          <AvatarGroup>
            {task.assignee ? (
              <Avatar size="sm">
                <AvatarImage src={task.assignee.avatarUrl ?? undefined} alt="" />
                <AvatarFallback>{initials(task.assignee.name)}</AvatarFallback>
              </Avatar>
            ) : null}
            {task.sharedUsers.slice(0, 2).map((person) => (
              <Avatar key={person.id} size="sm">
                <AvatarImage src={person.avatarUrl ?? undefined} alt="" />
                <AvatarFallback>{initials(person.name)}</AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
        </div>
      </button>
    </article>
  );
}
