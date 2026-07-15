"use client";
import type { BoardFilter, BoardSort } from "@/features/boards/types/board.types";
import { cn } from "@/lib/utils";

interface Props {
  filter: BoardFilter;
  sort: BoardSort;
  onFilterChange: (filter: BoardFilter) => void;
  onSortChange: (sort: BoardSort) => void;
}
const filters: Array<{ value: BoardFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "admin", label: "Administrados" },
  { value: "shared", label: "Compartilhados" },
];

export function DashboardFilters({ filter, sort, onFilterChange, onSortChange }: Props) {
  return (
    <section className="flex flex-col justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
      <div
        className="grid grid-cols-3 rounded-lg bg-surface-low p-1"
        role="group"
        aria-label="Filtrar boards"
      >
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onFilterChange(item.value)}
            className={cn(
              "rounded-md px-2 py-1.5 font-label text-label-md transition-colors sm:px-4",
              filter === item.value
                ? "bg-surface-high text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
            aria-pressed={filter === item.value}
          >
            {item.label}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2 font-label text-label-sm text-muted-foreground">
        Ordenar por:
        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value as BoardSort)}
          className="h-9 rounded-lg border bg-background px-3 font-label text-label-md text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="recent">Mais recentes</option>
          <option value="updated">Última atualização</option>
          <option value="name">Nome</option>
        </select>
      </label>
    </section>
  );
}
