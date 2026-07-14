import type { Prisma } from "@prisma/client";
export const tagSelect = {
  id: true,
  boardId: true,
  name: true,
  color: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TagSelect;
export type TagView = Prisma.TagGetPayload<{ select: typeof tagSelect }>;
