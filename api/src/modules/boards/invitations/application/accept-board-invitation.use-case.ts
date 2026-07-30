import { Injectable } from "@nestjs/common";

import { UseCase } from "@shared/application/use-case.interface";
import { BoardInvitationNotFoundError } from "../errors/board-invitation-not-found.error";
import {
  type BoardInvitationDetails,
} from "../presentation/selects/board-invitation.select";
import { InvitationTokenService } from "../services/invitation-token.service";
import { BoardInvitationAcceptanceService } from "./board-invitation-acceptance.service";
import { PrismaService } from "@shared/database/prisma.service";

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
    private readonly acceptance: BoardInvitationAcceptanceService,
  ) {}

  async execute(
    input: AcceptBoardInvitationInput,
  ): Promise<BoardInvitationDetails> {
    const token = input.token.trim();
    if (!/^[a-f0-9]{64}$/i.test(token)) {
      throw new BoardInvitationNotFoundError();
    }
    const tokenHash = this.invitationTokens.hash(token);
    const invitation = await this.prisma.boardMember.findUnique({
      where: { inviteTokenHash: tokenHash },
      select: { id: true },
    });
    if (!invitation) throw new BoardInvitationNotFoundError();
    return this.acceptance.accept({
      invitationId: invitation.id,
      currentUserId: input.currentUserId,
      currentUserEmail: input.currentUserEmail,
      expectedTokenHash: tokenHash,
    });
  }
}
