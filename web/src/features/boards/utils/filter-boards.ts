import type { BoardFilter, BoardSort, BoardSummary } from "@/features/boards/types/board.types";

interface FilterBoardsOptions {
  search: string;
  filter: BoardFilter;
  sort: BoardSort;
}

export function filterBoards(
  boards: BoardSummary[],
  { search, filter, sort }: FilterBoardsOptions,
) {
  const term = search.trim().toLocaleLowerCase("pt-BR");
  const filtered = boards.filter((board) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "admin" && board.role === "ADMIN") ||
      (filter === "shared" && board.role === "COLLABORATOR");
    const matchesSearch =
      !term ||
      board.name.toLocaleLowerCase("pt-BR").includes(term) ||
      board.description?.toLocaleLowerCase("pt-BR").includes(term);
    return matchesFilter && Boolean(matchesSearch);
  });

  return [...filtered].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name, "pt-BR");
    const field = sort === "recent" ? "createdAt" : "updatedAt";
    return Date.parse(b[field]) - Date.parse(a[field]);
  });
}
