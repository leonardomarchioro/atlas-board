import { Injectable } from "@nestjs/common";

import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";

import { BoardInvitationNotFoundError } from "../errors/board-invitation-not-found.error";
import {
  type BoardInvitationDetails,
  boardInvitationSelect,
} from "../presentation/selects/board-invitation.select";

export type GetAuthenticatedBoardInvitationInput = {
  invitationId: string;
  currentUserId: string;
  currentUserEmail: string;
};

const normalizeEmail = (value: string) => value.trim().toLowerCase();

@Injectable()
export class GetAuthenticatedBoardInvitationUseCase implements UseCase<
  GetAuthenticatedBoardInvitationInput,
  BoardInvitationDetails
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    input: GetAuthenticatedBoardInvitationInput,
  ): Promise<BoardInvitationDetails> {
    const [invitation, user] = await Promise.all([
      this.prisma.boardMember.findUnique({
        where: { id: input.invitationId },
        select: boardInvitationSelect,
      }),
      this.prisma.user.findUnique({
        where: { id: input.currentUserId },
        select: { email: true },
      }),
    ]);
    if (!invitation || !user) throw new BoardInvitationNotFoundError();

    const invitedEmail = normalizeEmail(invitation.email);
    if (
      invitedEmail !== normalizeEmail(input.currentUserEmail) ||
      invitedEmail !== normalizeEmail(user.email) ||
      (invitation.status === "ACTIVE" &&
        invitation.userId !== input.currentUserId)
    ) {
      throw new BoardInvitationNotFoundError();
    }
    return invitation;
  }
}
