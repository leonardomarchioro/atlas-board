import type {
  TaskComment,
  TaskDetails,
  UpdateTaskInput,
} from "@/features/tasks/types/task.types";
import { api } from "@/lib/axios";

const taskPath = (taskId: string) => `/tasks/${encodeURIComponent(taskId)}`;

export async function updateTask({ taskId, boardId, ...input }: UpdateTaskInput) {
  void boardId;
  return (await api.patch<TaskDetails>(taskPath(taskId), input)).data;
}

export async function deleteTask(taskId: string) {
  await api.delete(taskPath(taskId));
}

export async function addChecklistItem(taskId: string, title: string) {
  return (await api.post<TaskDetails>(`${taskPath(taskId)}/checklist`, { title })).data;
}

export async function updateChecklistItem(
  taskId: string,
  itemId: string,
  input: { title?: string; isCompleted?: boolean },
) {
  return (
    await api.patch<TaskDetails>(
      `${taskPath(taskId)}/checklist/${encodeURIComponent(itemId)}`,
      input,
    )
  ).data;
}

export async function deleteChecklistItem(taskId: string, itemId: string) {
  return (
    await api.delete<TaskDetails>(
      `${taskPath(taskId)}/checklist/${encodeURIComponent(itemId)}`,
    )
  ).data;
}

export async function listTaskComments(taskId: string) {
  return (await api.get<TaskComment[]>(`${taskPath(taskId)}/comments`)).data;
}

export async function createTaskComment(taskId: string, content: string) {
  return (await api.post<TaskComment>(`${taskPath(taskId)}/comments`, { content })).data;
}

export async function updateTaskComment(taskId: string, commentId: string, content: string) {
  return (
    await api.patch<TaskComment>(
      `${taskPath(taskId)}/comments/${encodeURIComponent(commentId)}`,
      { content },
    )
  ).data;
}

export async function deleteTaskComment(taskId: string, commentId: string) {
  await api.delete(`${taskPath(taskId)}/comments/${encodeURIComponent(commentId)}`);
}
