export type BoardRole = "ADMIN" | "COLLABORATOR";

export interface BoardSummary {
  id: string;
  name: string;
  description: string | null;
  role: BoardRole;
  members: BoardMember[];
  membersCount: number;
  tasksCount: number;
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

export interface UpdateBoardInput {
  boardId: string;
  name?: string;
  description?: string | null;
}

export type BoardFilter = "all" | "admin" | "shared";
export type BoardSort = "recent" | "updated" | "name";
