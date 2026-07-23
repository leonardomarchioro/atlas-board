import type { TaskDetails } from "@/features/tasks/types/task.types";
import { api } from "@/lib/axios";

export async function getTask(taskId: string): Promise<TaskDetails> {
  return (await api.get<TaskDetails>(`/tasks/${encodeURIComponent(taskId)}`)).data;
}
