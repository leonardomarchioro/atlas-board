export const boardKeys = {
  all: ["boards"] as const,
  lists: () => [...boardKeys.all, "list"] as const,
  userBoards: () => [...boardKeys.lists(), "user"] as const,
  details: () => [...boardKeys.all, "detail"] as const,
  detail: (boardId: string) => [...boardKeys.details(), boardId] as const,
  members: (boardId: string) => [...boardKeys.detail(boardId), "members"] as const,
};
