import type { MoveTaskInput, TaskDetails } from "@/features/tasks/types/task.types";
import { api } from "@/lib/axios";

export async function moveTask({
  taskId,
  columnId,
  position,
}: MoveTaskInput): Promise<TaskDetails> {
  return (
    await api.patch<TaskDetails>(`/tasks/${encodeURIComponent(taskId)}/move`, {
      columnId,
      position,
    })
  ).data;
}
