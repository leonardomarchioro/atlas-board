import type { Prisma } from "@prisma/client";

export const boardSummarySelect = {
  id: true,
  name: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  members: { select: { userId: true, role: true, status: true } },
} satisfies Prisma.BoardSelect;

export type BoardSummary = Prisma.BoardGetPayload<{
  select: typeof boardSummarySelect;
}>;
