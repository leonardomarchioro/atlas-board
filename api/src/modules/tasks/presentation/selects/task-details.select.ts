import type { Prisma } from "@prisma/client";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
} as const;

export const taskDetailsSelect = {
  id: true,
  boardId: true,
  columnId: true,
  title: true,
  description: true,
  priority: true,
  position: true,
  dueDate: true,
  assignee: { select: publicUserSelect },
  createdBy: { select: publicUserSelect },
  sharedWith: {
    orderBy: { user: { name: "asc" } },
    select: { user: { select: publicUserSelect } },
  },
  tags: {
    orderBy: { tag: { name: "asc" } },
    select: { tag: { select: { id: true, name: true, color: true } } },
  },
  checklistItems: {
    orderBy: { position: "asc" },
    select: {
      id: true,
      title: true,
      isCompleted: true,
      position: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TaskSelect;

export type TaskDetails = Prisma.TaskGetPayload<{
  select: typeof taskDetailsSelect;
}>;
