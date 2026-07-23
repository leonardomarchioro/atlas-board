import type { CreateTaskInput, TaskDetails } from "@/features/tasks/types/task.types";
import { api } from "@/lib/axios";

export async function createTask({ boardId, ...input }: CreateTaskInput): Promise<TaskDetails> {
  return (await api.post<TaskDetails>(`/boards/${encodeURIComponent(boardId)}/tasks`, input)).data;
}
