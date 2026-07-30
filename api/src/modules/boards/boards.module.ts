import { Module } from "@nestjs/common";
import { NotificationsModule } from "@modules/notifications/notifications.module";

import { InviteMailService } from "@shared/mail/invite-mail.service";
import { MockInviteMailService } from "@shared/mail/mock-invite-mail.service";
import { CreateBoardUseCase } from "./application/create-board.use-case";
import { CreateBoardColumnUseCase } from "./application/create-board-column.use-case";
import { DeleteBoardColumnUseCase } from "./application/delete-board-column.use-case";
import { DeleteBoardUseCase } from "./application/delete-board.use-case";
import { GetBoardByIdUseCase } from "./application/get-board-by-id.use-case";
import { ListBoardMembersUseCase } from "./application/list-board-members.use-case";
import { ListBoardColumnsUseCase } from "./application/list-board-columns.use-case";
import { ListUserBoardsUseCase } from "./application/list-user-boards.use-case";
import { RemoveBoardMemberUseCase } from "./application/remove-board-member.use-case";
import { ReorderBoardColumnsUseCase } from "./application/reorder-board-columns.use-case";
import { UpdateBoardUseCase } from "./application/update-board.use-case";
import { UpdateBoardColumnUseCase } from "./application/update-board-column.use-case";
import { AcceptBoardInvitationUseCase } from "./invitations/application/accept-board-invitation.use-case";
import { GetBoardInvitationUseCase } from "./invitations/application/get-board-invitation.use-case";
import { InviteBoardMemberUseCase } from "./invitations/application/invite-board-member.use-case";
import { BoardInvitationsController } from "./invitations/presentation/board-invitations.controller";
import { CryptoInvitationTokenService } from "./invitations/services/crypto-invitation-token.service";
import { InvitationTokenService } from "./invitations/services/invitation-token.service";
import { BoardsController } from "./presentation/boards.controller";
import { BoardColumnsController } from "./presentation/board-columns.controller";
import { BoardAccessService } from "./services/board-access.service";

@Module({
  imports: [NotificationsModule],
  controllers: [
    BoardsController,
    BoardColumnsController,
    BoardInvitationsController,
  ],
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
    ListBoardColumnsUseCase,
    CreateBoardColumnUseCase,
    UpdateBoardColumnUseCase,
    ReorderBoardColumnsUseCase,
    DeleteBoardColumnUseCase,
    {
      provide: InvitationTokenService,
      useClass: CryptoInvitationTokenService,
    },
    { provide: InviteMailService, useClass: MockInviteMailService },
  ],
  exports: [BoardAccessService],
})
export class BoardsModule {}
