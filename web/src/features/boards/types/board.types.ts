export type BoardRole = "ADMIN" | "COLLABORATOR";

export interface BoardSummary {
  id: string;
  name: string;
  description: string | null;
  role: BoardRole;
  createdAt: string;
  updatedAt: string;
}

export interface BoardPerson {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface BoardMember {
  id: string;
  role: BoardRole;
  user: BoardPerson;
}

export interface BoardColumn {
  id: string;
  name: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface BoardDetails {
  id: string;
  name: string;
  description: string | null;
  role: BoardRole;
  createdBy: BoardPerson;
  members: BoardMember[];
  columns: BoardColumn[];
  createdAt: string;
  updatedAt: string;
}

export type BoardFilter = "all" | "admin" | "shared";
export type BoardSort = "recent" | "updated" | "name";
