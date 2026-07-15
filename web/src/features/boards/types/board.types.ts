export type BoardRole = "ADMIN" | "COLLABORATOR";

export interface BoardSummary {
  id: string;
  name: string;
  description: string | null;
  role: BoardRole;
  createdAt: string;
  updatedAt: string;
}

export type BoardFilter = "all" | "admin" | "shared";
export type BoardSort = "recent" | "updated" | "name";
