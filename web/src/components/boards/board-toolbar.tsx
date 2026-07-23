"use client";

import { FilterX, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BoardMember } from "@/features/boards/types/board.types";
import type { TaskFilters, TaskTag } from "@/features/tasks/types/task.types";

const selectClass =
  "h-9 rounded-md border bg-background px-2 font-label text-label-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

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
      <select
        value={filters.assigneeId}
        onChange={(event) => update("assigneeId", event.target.value)}
        className={selectClass}
        aria-label="Filtrar por responsável"
      >
        <option value="all">Todos os responsáveis</option>
        <option value="unassigned">Sem responsável</option>
        {members.map((member) => (
          <option key={member.user.id} value={member.user.id}>
            {member.user.name}
          </option>
        ))}
      </select>
      <select
        value={filters.priority}
        onChange={(event) => update("priority", event.target.value as TaskFilters["priority"])}
        className={selectClass}
        aria-label="Filtrar por prioridade"
      >
        <option value="all">Todas as prioridades</option>
        <option value="LOW">Baixa</option>
        <option value="MEDIUM">Média</option>
        <option value="HIGH">Alta</option>
      </select>
      <select
        value={filters.tagId}
        onChange={(event) => update("tagId", event.target.value)}
        className={selectClass}
        aria-label="Filtrar por tag"
      >
        <option value="all">Todas as tags</option>
        {tags.map((tag) => (
          <option key={tag.id} value={tag.id}>
            {tag.name}
          </option>
        ))}
      </select>
      <select
        value={filters.dueDate}
        onChange={(event) => update("dueDate", event.target.value as TaskFilters["dueDate"])}
        className={selectClass}
        aria-label="Filtrar por prazo"
      >
        <option value="all">Todos os prazos</option>
        <option value="overdue">Atrasadas</option>
        <option value="today">Hoje</option>
        <option value="next-seven-days">Próximos 7 dias</option>
        <option value="none">Sem prazo</option>
      </select>
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
