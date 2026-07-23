import type { Prisma } from "@prisma/client";

export const boardColumnSelect = {
  id: true,
  boardId: true,
  name: true,
  position: true,
  _count: {
    select: {
      tasks: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.BoardColumnSelect;

export type BoardColumnView = Prisma.BoardColumnGetPayload<{
  select: typeof boardColumnSelect;
}>;
