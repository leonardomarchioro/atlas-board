export const taskKeys = {
  all: ["tasks"] as const,
  boards: () => [...taskKeys.all, "board"] as const,
  board: (boardId: string) => [...taskKeys.boards(), boardId] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (taskId: string) => [...taskKeys.details(), taskId] as const,
  tags: (boardId: string) => [...taskKeys.all, "tags", boardId] as const,
};
