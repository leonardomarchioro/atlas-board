export const boardKeys = {
  all: ["boards"] as const,
  lists: () => [...boardKeys.all, "list"] as const,
  userBoards: () => [...boardKeys.lists(), "user"] as const,
};
