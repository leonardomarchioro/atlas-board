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
      createdBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  },
} satisfies Prisma.BoardMemberSelect;

export type BoardInvitationDetails = Prisma.BoardMemberGetPayload<{
  select: typeof boardInvitationSelect;
}>;
