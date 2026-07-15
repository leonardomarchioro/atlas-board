import { Injectable } from "@nestjs/common";

import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";

import { UserNotFoundError } from "@modules/users/errors/user-not-found.error";
import { BoardInvitationAlreadyAcceptedError } from "../errors/board-invitation-already-accepted.error";
import { BoardInvitationEmailMismatchError } from "../errors/board-invitation-email-mismatch.error";
import { BoardInvitationExpiredError } from "../errors/board-invitation-expired.error";
import { BoardInvitationNotFoundError } from "../errors/board-invitation-not-found.error";
import { BoardMemberAlreadyExistsError } from "../errors/board-member-already-exists.error";
import {
  BoardInvitationDetails,
  boardInvitationSelect,
} from "../presentation/selects/board-invitation.select";
import { InvitationTokenService } from "../services/invitation-token.service";

export interface AcceptBoardInvitationInput {
  token: string;
  currentUserId: string;
  currentUserEmail: string;
}

@Injectable()
export class AcceptBoardInvitationUseCase implements UseCase<
  AcceptBoardInvitationInput,
  BoardInvitationDetails
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invitationTokens: InvitationTokenService,
  ) {}

  async execute(
    input: AcceptBoardInvitationInput,
  ): Promise<BoardInvitationDetails> {
    const token = input.token.trim();
    if (!/^[a-f0-9]{64}$/i.test(token)) {
      throw new BoardInvitationNotFoundError();
    }
    const tokenHash = this.invitationTokens.hash(token);
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const invitation = await tx.boardMember.findUnique({
        where: { inviteTokenHash: tokenHash },
        select: boardInvitationSelect,
      });
      if (!invitation) throw new BoardInvitationNotFoundError();
      if (invitation.status !== "PENDING" || invitation.userId !== null) {
        throw new BoardInvitationAlreadyAcceptedError();
      }
      if (
        invitation.inviteExpiresAt === null ||
        invitation.inviteExpiresAt.getTime() <= now.getTime()
      ) {
        throw new BoardInvitationExpiredError();
      }

      const user = await tx.user.findUnique({
        where: { id: input.currentUserId },
        select: { email: true },
      });
      if (!user) throw new UserNotFoundError();

      const invitedEmail = invitation.email.trim().toLowerCase();
      const authenticatedEmail = input.currentUserEmail.trim().toLowerCase();
      const persistedEmail = user.email.trim().toLowerCase();
      if (
        invitedEmail !== authenticatedEmail ||
        invitedEmail !== persistedEmail
      ) {
        throw new BoardInvitationEmailMismatchError();
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
          inviteTokenHash: tokenHash,
          inviteExpiresAt: { gt: now },
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
          select: {
            status: true,
            userId: true,
            inviteExpiresAt: true,
            inviteTokenHash: true,
          },
        });
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

      return tx.boardMember.findUniqueOrThrow({
        where: { id: invitation.id },
        select: boardInvitationSelect,
      });
    });
  }
}
