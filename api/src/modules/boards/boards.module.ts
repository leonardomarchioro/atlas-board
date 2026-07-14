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
import { BoardsController } from "./presentation/boards.controller";
import { BoardAccessService } from "./services/board-access.service";

@Module({
  controllers: [BoardsController],
  providers: [
    CreateBoardUseCase,
    ListUserBoardsUseCase,
    GetBoardByIdUseCase,
    UpdateBoardUseCase,
    DeleteBoardUseCase,
    ListBoardMembersUseCase,
    RemoveBoardMemberUseCase,
    BoardAccessService,
    { provide: InviteMailService, useClass: MockInviteMailService },
  ],
  exports: [BoardAccessService],
})
export class BoardsModule {}
