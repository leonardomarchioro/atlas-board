import type { BoardTag } from "@/features/tasks/types/task.types";
import { api } from "@/lib/axios";

export interface UpdateBoardTagInput {
  boardId: string;
  tagId: string;
  name?: string;
  color?: string;
}

export async function updateBoardTag({
  boardId,
  tagId,
  ...input
}: UpdateBoardTagInput): Promise<BoardTag> {
  const response = await api.patch<BoardTag>(
    `/boards/${encodeURIComponent(boardId)}/tags/${encodeURIComponent(tagId)}`,
    input,
  );
  return response.data;
}
