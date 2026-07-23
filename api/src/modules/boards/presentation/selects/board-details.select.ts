import type { Prisma } from "@prisma/client";

export const boardDetailsSelect = {
  id: true,
  name: true,
  description: true,
  createdById: true,
  createdBy: { select: { id: true, name: true, avatarUrl: true } },
  createdAt: true,
  updatedAt: true,
  members: {
    where: { status: "ACTIVE", userId: { not: null } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      role: true,
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
  },
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
