import type { Prisma } from "@prisma/client";

export const boardDetailsSelect = {
  id: true,
  name: true,
  description: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
  columns: {
    orderBy: { position: "asc" },
    select: {
      id: true,
      name: true,
      position: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.BoardSelect;

export type BoardDetails = Prisma.BoardGetPayload<{
  select: typeof boardDetailsSelect;
}>;
