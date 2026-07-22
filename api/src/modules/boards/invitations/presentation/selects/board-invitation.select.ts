import type { Prisma } from "@prisma/client";

export const boardInvitationSelect = {
  id: true,
  email: true,
  role: true,
  status: true,
  userId: true,
  inviteExpiresAt: true,
  acceptedAt: true,
  board: {
    select: {
      id: true,
      name: true,
      description: true,
      members: {
        where: { status: "ACTIVE", userId: { not: null } },
        orderBy: { createdAt: "asc" },
        take: 5,
        select: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
      _count: {
        select: {
          members: { where: { status: "ACTIVE", userId: { not: null } } },
        },
      },
      createdBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  },
} satisfies Prisma.BoardMemberSelect;

export type BoardInvitationDetails = Prisma.BoardMemberGetPayload<{
  select: typeof boardInvitationSelect;
}>;
