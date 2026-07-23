import type { BoardTask } from "@/features/tasks/types/task.types";
import { api } from "@/lib/axios";

export async function listBoardTasks(boardId: string): Promise<BoardTask[]> {
  return (await api.get<BoardTask[]>(`/boards/${encodeURIComponent(boardId)}/tasks`)).data;
}
