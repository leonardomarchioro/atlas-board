import type { Prisma } from "@prisma/client";

export const taskCommentSelect = {
  id: true,
  taskId: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: { id: true, name: true, email: true, avatarUrl: true },
  },
} satisfies Prisma.TaskCommentSelect;

export type TaskCommentWithAuthor = Prisma.TaskCommentGetPayload<{
  select: typeof taskCommentSelect;
}>;
