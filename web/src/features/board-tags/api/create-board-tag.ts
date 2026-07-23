import type { BoardTag } from "@/features/tasks/types/task.types";
import { api } from "@/lib/axios";

export interface CreateBoardTagInput {
  boardId: string;
  name: string;
  color: string;
}

export async function createBoardTag({
  boardId,
  ...input
}: CreateBoardTagInput): Promise<BoardTag> {
  const response = await api.post<BoardTag>(`/boards/${encodeURIComponent(boardId)}/tags`, input);
  return response.data;
}
