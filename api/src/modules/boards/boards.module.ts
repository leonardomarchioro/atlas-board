import { Module } from "@nestjs/common";

import { InviteMailService } from "@shared/mail/invite-mail.service";
import { MockInviteMailService } from "@shared/mail/mock-invite-mail.service";
import { CreateBoardUseCase } from "./application/create-board.use-case";
import { DeleteBoardUseCase } from "./application/delete-board.use-case";
import { GetBoardByIdUseCase } from "./application/get-board-by-id.use-case";
import { ListBoardMembersUseCase } from "./application/list-board-members.use-case";
import { ListUserBoardsUseCase } from "./application/list-user-boards.use-case";
import { RemoveBoardMemberUseCase } from "./application/remove-board-member.use-case";
import { UpdateBoardUseCase } from "./application/update-board.use-case";
import { AcceptBoardInvitationUseCase } from "./invitations/application/accept-board-invitation.use-case";
import { GetBoardInvitationUseCase } from "./invitations/application/get-board-invitation.use-case";
import { InviteBoardMemberUseCase } from "./invitations/application/invite-board-member.use-case";
import { BoardInvitationsController } from "./invitations/presentation/board-invitations.controller";
import { CryptoInvitationTokenService } from "./invitations/services/crypto-invitation-token.service";
import { InvitationTokenService } from "./invitations/services/invitation-token.service";
import { BoardsController } from "./presentation/boards.controller";
import { BoardAccessService } from "./services/board-access.service";

@Module({
  controllers: [BoardsController, BoardInvitationsController],
  providers: [
    CreateBoardUseCase,
    ListUserBoardsUseCase,
    GetBoardByIdUseCase,
    UpdateBoardUseCase,
    DeleteBoardUseCase,
    ListBoardMembersUseCase,
    RemoveBoardMemberUseCase,
    BoardAccessService,
    GetBoardInvitationUseCase,
    AcceptBoardInvitationUseCase,
    InviteBoardMemberUseCase,
    {
      provide: InvitationTokenService,
      useClass: CryptoInvitationTokenService,
    },
    { provide: InviteMailService, useClass: MockInviteMailService },
  ],
  exports: [BoardAccessService],
})
export class BoardsModule {}
