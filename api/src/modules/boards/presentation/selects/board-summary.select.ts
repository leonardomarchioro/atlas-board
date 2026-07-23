import type { Prisma } from "@prisma/client";

export const boardSummarySelect = {
  id: true,
  name: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  members: {
    where: { status: "ACTIVE", userId: { not: null } },
    orderBy: { createdAt: "asc" },
    take: 4,
    select: {
      id: true,
      role: true,
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
  },
  _count: {
    select: {
      tasks: true,
      members: {
        where: { status: "ACTIVE", userId: { not: null } },
      },
    },
  },
} satisfies Prisma.BoardSelect;

export type BoardSummary = Prisma.BoardGetPayload<{
  select: typeof boardSummarySelect;
}>;
