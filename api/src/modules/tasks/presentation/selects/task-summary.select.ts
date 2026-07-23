import type { Prisma } from "@prisma/client";

export const taskSummarySelect = {
  id: true,
  boardId: true,
  columnId: true,
  title: true,
  description: true,
  priority: true,
  position: true,
  dueDate: true,
  assignee: { select: { id: true, name: true, avatarUrl: true } },
  sharedWith: {
    orderBy: { user: { name: "asc" } },
    select: { user: { select: { id: true, name: true, avatarUrl: true } } },
  },
  tags: {
    orderBy: { tag: { name: "asc" } },
    select: { tag: { select: { id: true, name: true, color: true } } },
  },
  checklistItems: { select: { isCompleted: true } },
  _count: { select: { comments: true } },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TaskSelect;

export type TaskSummary = Prisma.TaskGetPayload<{
  select: typeof taskSummarySelect;
}>;
