"use client";

import { FilterX, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BoardMember } from "@/features/boards/types/board.types";
import type { TaskFilters, TaskTag } from "@/features/tasks/types/task.types";

export function BoardToolbar({
  filters,
  members,
  tags,
  activeCount,
  onChange,
  onClear,
  onCreate,
}: {
  filters: TaskFilters;
  members: BoardMember[];
  tags: TaskTag[];
  activeCount: number;
  onChange: (next: TaskFilters) => void;
  onClear: () => void;
  onCreate: () => void;
}) {
  const update = <Key extends keyof TaskFilters>(key: Key, value: TaskFilters[Key]) =>
    onChange({ ...filters, [key]: value });
  return (
    <section
      className="flex flex-wrap items-center gap-2 border-b bg-background px-4 py-3 lg:px-8"
      aria-label="Filtros de tarefas"
    >
      <div className="relative min-w-56 flex-1 sm:max-w-sm">
        <Search
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={filters.search}
          onChange={(event) => update("search", event.target.value)}
          className="h-9 bg-surface-low pl-9 pr-9"
          placeholder="Buscar tarefa por título..."
          aria-label="Buscar tarefa por título"
        />
        {filters.search ? (
          <button
            type="button"
            onClick={() => update("search", "")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
            aria-label="Limpar busca"
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>
      <Select
        value={filters.assigneeId}
        onValueChange={(value) => {
          if (value) update("assigneeId", value);
        }}
      >
        <SelectTrigger size="sm" className="w-48" aria-label="Filtrar por responsável">
          <SelectValue>
            {filters.assigneeId === "all"
              ? "Todos os responsáveis"
              : filters.assigneeId === "unassigned"
                ? "Sem responsável"
                : (members.find((member) => member.user.id === filters.assigneeId)?.user.name ??
                  "Responsável")}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os responsáveis</SelectItem>
          <SelectItem value="unassigned">Sem responsável</SelectItem>
          {members.map((member) => (
            <SelectItem key={member.user.id} value={member.user.id}>
              {member.user.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.priority}
        onValueChange={(value) => {
          if (value) update("priority", value as TaskFilters["priority"]);
        }}
      >
        <SelectTrigger size="sm" className="w-44" aria-label="Filtrar por prioridade">
          <SelectValue>
            {
              {
                all: "Todas as prioridades",
                LOW: "Baixa",
                MEDIUM: "Média",
                HIGH: "Alta",
                URGENT: "Urgente",
              }[filters.priority]
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as prioridades</SelectItem>
          <SelectItem value="LOW">Baixa</SelectItem>
          <SelectItem value="MEDIUM">Média</SelectItem>
          <SelectItem value="HIGH">Alta</SelectItem>
          <SelectItem value="URGENT">Urgente</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.tagId}
        onValueChange={(value) => {
          if (value) update("tagId", value);
        }}
      >
        <SelectTrigger size="sm" className="w-40" aria-label="Filtrar por tag">
          <SelectValue>
            {filters.tagId === "all"
              ? "Todas as tags"
              : (tags.find((tag) => tag.id === filters.tagId)?.name ?? "Tag")}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as tags</SelectItem>
          {tags.map((tag) => (
            <SelectItem key={tag.id} value={tag.id}>
              {tag.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.dueDate}
        onValueChange={(value) => {
          if (value) update("dueDate", value as TaskFilters["dueDate"]);
        }}
      >
        <SelectTrigger size="sm" className="w-44" aria-label="Filtrar por prazo">
          <SelectValue>
            {
              {
                all: "Todos os prazos",
                overdue: "Atrasadas",
                today: "Hoje",
                "next-seven-days": "Próximos 7 dias",
                none: "Sem prazo",
              }[filters.dueDate]
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os prazos</SelectItem>
          <SelectItem value="overdue">Atrasadas</SelectItem>
          <SelectItem value="today">Hoje</SelectItem>
          <SelectItem value="next-seven-days">Próximos 7 dias</SelectItem>
          <SelectItem value="none">Sem prazo</SelectItem>
        </SelectContent>
      </Select>
      {activeCount ? (
        <Button variant="ghost" size="sm" onClick={onClear}>
          <FilterX aria-hidden />
          Limpar filtros ({activeCount})
        </Button>
      ) : null}
      <Button className="ml-auto" onClick={onCreate}>
        <Plus aria-hidden />
        Nova tarefa
      </Button>
    </section>
  );
}
