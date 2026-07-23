import type { TaskTag } from "@/features/tasks/types/task.types";
import { api } from "@/lib/axios";

export async function listBoardTags(boardId: string): Promise<TaskTag[]> {
  return (await api.get<TaskTag[]>(`/boards/${encodeURIComponent(boardId)}/tags`)).data;
}
