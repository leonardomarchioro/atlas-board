"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BoardCard } from "@/components/dashboard/board-card";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { BoardsEmptyState, BoardsErrorState, BoardsNoResults, DashboardLoading } from "@/components/dashboard/dashboard-states";
import { DashboardSummary } from "@/components/dashboard/dashboard-summary";
import { buttonVariants } from "@/components/ui/button";
import { useUserBoards } from "@/features/boards/hooks/use-user-boards";
import type { BoardFilter, BoardSort } from "@/features/boards/types/board.types";
import { filterBoards } from "@/features/boards/utils/filter-boards";
import { cn } from "@/lib/utils";

export function DashboardContent() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<BoardFilter>("all");
  const [sort, setSort] = useState<BoardSort>("updated");
  const boardsQuery = useUserBoards();
  const boards = useMemo(() => boardsQuery.data ?? [], [boardsQuery.data]);
  const visibleBoards = useMemo(() => filterBoards(boards, { search, filter, sort }), [boards, search, filter, sort]);
  const clearFilters = () => { setSearch(""); setFilter("all"); setSort("updated"); };

  return <div className="flex min-h-screen flex-col bg-background">
    <DashboardHeader search={search} onSearchChange={setSearch} />
    <main className="atlas-container flex-1 pb-10 pt-36 md:pt-24">
      {boardsQuery.isLoading ? <DashboardLoading /> : boardsQuery.isError ? <BoardsErrorState onRetry={() => void boardsQuery.refetch()} /> : boards.length === 0 ? <><section className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="text-headline-lg">Meus Boards</h1><p className="text-body-md text-muted-foreground">Acompanhe os boards que você criou ou participa.</p></div></section><BoardsEmptyState /></> : <div className="space-y-6">
        <DashboardSummary boards={boards} />
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="text-headline-lg">Meus Boards</h1><p className="text-body-md text-muted-foreground">Acompanhe os boards que você criou ou participa.</p></div><Link href="/boards/novo" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}><Plus aria-hidden />Criar Novo Board</Link></section>
        <DashboardFilters filter={filter} sort={sort} onFilterChange={setFilter} onSortChange={setSort} />
        {visibleBoards.length === 0 ? <BoardsNoResults onClear={clearFilters} /> : <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3" aria-label="Boards"><>{visibleBoards.map((board) => <BoardCard key={board.id} board={board} />)}</></section>}
      </div>}
    </main>
    <footer className="border-t bg-surface-low"><div className="atlas-container py-6 text-center text-body-sm text-muted-foreground md:text-left">© 2026 Atlas SaaS. Todos os direitos reservados.</div></footer>
  </div>;
}
