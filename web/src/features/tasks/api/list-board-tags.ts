import type { BoardTag } from "@/features/tasks/types/task.types";
import { api } from "@/lib/axios";

export async function listBoardTags(boardId: string): Promise<BoardTag[]> {
  return (await api.get<BoardTag[]>(`/boards/${encodeURIComponent(boardId)}/tags`)).data;
}
