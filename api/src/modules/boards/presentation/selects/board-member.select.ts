import type { Prisma } from "@prisma/client";

export const boardMemberSelect = {
  id: true,
  email: true,
  role: true,
  status: true,
  inviteExpiresAt: true,
  acceptedAt: true,
  user: { select: { id: true, name: true, email: true, avatarUrl: true } },
} satisfies Prisma.BoardMemberSelect;

export type BoardMemberView = Prisma.BoardMemberGetPayload<{
  select: typeof boardMemberSelect;
}>;
