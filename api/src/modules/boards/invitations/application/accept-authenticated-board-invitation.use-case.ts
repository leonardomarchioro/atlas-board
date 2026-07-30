import { Injectable } from "@nestjs/common";

import { UseCase } from "@shared/application/use-case.interface";

import type { BoardInvitationDetails } from "../presentation/selects/board-invitation.select";
import { BoardInvitationAcceptanceService } from "./board-invitation-acceptance.service";

export type AcceptAuthenticatedBoardInvitationInput = {
  invitationId: string;
  currentUserId: string;
  currentUserEmail: string;
};

@Injectable()
export class AcceptAuthenticatedBoardInvitationUseCase implements UseCase<
  AcceptAuthenticatedBoardInvitationInput,
  BoardInvitationDetails
> {
  constructor(private readonly acceptance: BoardInvitationAcceptanceService) {}

  execute(
    input: AcceptAuthenticatedBoardInvitationInput,
  ): Promise<BoardInvitationDetails> {
    return this.acceptance.accept({
      ...input,
      allowIdempotentActive: true,
    });
  }
}
