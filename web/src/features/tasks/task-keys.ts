export const taskKeys = {
  all: ["tasks"] as const,
  boards: () => [...taskKeys.all, "board"] as const,
  board: (boardId: string) => [...taskKeys.boards(), boardId] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (taskId: string) => [...taskKeys.details(), taskId] as const,
  comments: (taskId: string) => [...taskKeys.detail(taskId), "comments"] as const,
  checklist: (taskId: string) => [...taskKeys.detail(taskId), "checklist"] as const,
  tags: (boardId: string) => [...taskKeys.all, "tags", boardId] as const,
};
