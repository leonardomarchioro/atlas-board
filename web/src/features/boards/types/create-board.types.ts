import type { BoardDetails } from "@/features/boards/types/board.types";

export interface CreateBoardFormValues {
  name: string;
  description: string;
  columns: Array<{ id: string; name: string }>;
  memberEmails: string[];
}

export interface CreateBoardInput {
  name: string;
  description?: string;
  columns: Array<{ name: string }>;
  memberEmails?: string[];
}

export type CreateBoardResponse = BoardDetails;
