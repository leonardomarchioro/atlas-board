"use client";
import type { BoardFilter, BoardSort } from "@/features/boards/types/board.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
const sortLabels: Record<BoardSort, string> = {
  recent: "Mais recentes",
  updated: "Última atualização",
  name: "Nome",
};

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
      <div className="flex items-center gap-2 font-label text-label-sm text-muted-foreground">
        <span id="dashboard-sort-label">Ordenar por:</span>
        <Select
          value={sort}
          onValueChange={(value) => {
            if (value) onSortChange(value as BoardSort);
          }}
        >
          <SelectTrigger
            size="sm"
            className="w-48 font-label text-label-md text-foreground"
            aria-labelledby="dashboard-sort-label"
          >
            <SelectValue>{sortLabels[sort]}</SelectValue>
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="recent">Mais recentes</SelectItem>
            <SelectItem value="updated">Última atualização</SelectItem>
            <SelectItem value="name">Nome</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}
