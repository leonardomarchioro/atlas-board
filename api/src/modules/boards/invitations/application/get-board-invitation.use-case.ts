import { Injectable } from "@nestjs/common";

import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";

import { BoardInvitationNotFoundError } from "../errors/board-invitation-not-found.error";
import {
  BoardInvitationDetails,
  boardInvitationSelect,
} from "../presentation/selects/board-invitation.select";
import { InvitationTokenService } from "../services/invitation-token.service";

export interface GetBoardInvitationInput {
  token: string;
}

@Injectable()
export class GetBoardInvitationUseCase implements UseCase<
  GetBoardInvitationInput,
  BoardInvitationDetails
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invitationTokens: InvitationTokenService,
  ) {}

  async execute(
    input: GetBoardInvitationInput,
  ): Promise<BoardInvitationDetails> {
    const token = input.token.trim();
    if (!/^[a-f0-9]{64}$/i.test(token)) {
      throw new BoardInvitationNotFoundError();
    }

    const invitation = await this.prisma.boardMember.findUnique({
      where: { inviteTokenHash: this.invitationTokens.hash(token) },
      select: boardInvitationSelect,
    });
    if (!invitation) throw new BoardInvitationNotFoundError();
    return invitation;
  }
}
