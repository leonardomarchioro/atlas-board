import { Injectable } from "@nestjs/common";

import { PrismaService } from "@shared/database/prisma.service";
import { UserNotFoundError } from "@modules/users/errors/user-not-found.error";

import { BoardInvitationAlreadyAcceptedError } from "../errors/board-invitation-already-accepted.error";
import { BoardInvitationEmailMismatchError } from "../errors/board-invitation-email-mismatch.error";
import { BoardInvitationExpiredError } from "../errors/board-invitation-expired.error";
import { BoardInvitationNotFoundError } from "../errors/board-invitation-not-found.error";
import { BoardMemberAlreadyExistsError } from "../errors/board-member-already-exists.error";
import {
  type BoardInvitationDetails,
  boardInvitationSelect,
} from "../presentation/selects/board-invitation.select";

export type AcceptResolvedBoardInvitationInput = {
  invitationId: string;
  currentUserId: string;
  currentUserEmail: string;
  expectedTokenHash?: string;
  allowIdempotentActive?: boolean;
};

const normalizeEmail = (value: string) => value.trim().toLowerCase();

@Injectable()
export class BoardInvitationAcceptanceService {
  constructor(private readonly prisma: PrismaService) {}

  async accept(
    input: AcceptResolvedBoardInvitationInput,
  ): Promise<BoardInvitationDetails> {
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const invitation = await tx.boardMember.findUnique({
        where: { id: input.invitationId },
        select: { ...boardInvitationSelect, inviteTokenHash: true },
      });
      if (!invitation) throw new BoardInvitationNotFoundError();
      if (
        input.expectedTokenHash !== undefined &&
        invitation.inviteTokenHash !== input.expectedTokenHash
      ) {
        throw new BoardInvitationNotFoundError();
      }

      const user = await tx.user.findUnique({
        where: { id: input.currentUserId },
        select: { email: true },
      });
      if (!user) throw new UserNotFoundError();

      const invitedEmail = normalizeEmail(invitation.email);
      const authenticatedEmail = normalizeEmail(input.currentUserEmail);
      const persistedEmail = normalizeEmail(user.email);
      if (
        invitedEmail !== authenticatedEmail ||
        invitedEmail !== persistedEmail
      ) {
        throw new BoardInvitationEmailMismatchError();
      }

      if (invitation.status === "ACTIVE") {
        if (
          input.allowIdempotentActive &&
          invitation.userId === input.currentUserId
        ) {
          return tx.boardMember.findUniqueOrThrow({
            where: { id: invitation.id },
            select: boardInvitationSelect,
          });
        }
        throw new BoardInvitationAlreadyAcceptedError();
      }
      if (invitation.status !== "PENDING" || invitation.userId !== null) {
        throw new BoardInvitationAlreadyAcceptedError();
      }
      if (
        invitation.inviteExpiresAt === null ||
        invitation.inviteExpiresAt.getTime() <= now.getTime()
      ) {
        throw new BoardInvitationExpiredError();
      }

      const existingMembership = await tx.boardMember.findFirst({
        where: {
          boardId: invitation.board.id,
          userId: input.currentUserId,
          status: "ACTIVE",
          id: { not: invitation.id },
        },
        select: { id: true },
      });
      if (existingMembership) throw new BoardMemberAlreadyExistsError();

      const result = await tx.boardMember.updateMany({
        where: {
          id: invitation.id,
          status: "PENDING",
          userId: null,
          inviteExpiresAt: { gt: now },
          ...(input.expectedTokenHash
            ? { inviteTokenHash: input.expectedTokenHash }
            : {}),
        },
        data: {
          userId: input.currentUserId,
          status: "ACTIVE",
          acceptedAt: now,
          inviteTokenHash: null,
          inviteExpiresAt: null,
        },
      });

      if (result.count !== 1) {
        const current = await tx.boardMember.findUnique({
          where: { id: invitation.id },
          select: { status: true, userId: true, inviteExpiresAt: true },
        });
        if (
          input.allowIdempotentActive &&
          current?.status === "ACTIVE" &&
          current.userId === input.currentUserId
        ) {
          return tx.boardMember.findUniqueOrThrow({
            where: { id: invitation.id },
            select: boardInvitationSelect,
          });
        }
        if (current?.status === "ACTIVE" || current?.userId !== null) {
          throw new BoardInvitationAlreadyAcceptedError();
        }
        if (
          current?.inviteExpiresAt === null ||
          (current?.inviteExpiresAt !== undefined &&
            current.inviteExpiresAt.getTime() <= now.getTime())
        ) {
          throw new BoardInvitationExpiredError();
        }
        throw new BoardInvitationNotFoundError();
      }

      await tx.notification.updateMany({
        where: {
          userId: input.currentUserId,
          type: "BOARD_INVITATION_RECEIVED",
          readAt: null,
          data: { path: ["invitationId"], equals: invitation.id },
        },
        data: { readAt: now },
      });

      return tx.boardMember.findUniqueOrThrow({
        where: { id: invitation.id },
        select: boardInvitationSelect,
      });
    });
  }
}
