import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";

import type { AuthenticatedUser } from "@shared/auth/authenticated-user.interface";
import { CurrentUser } from "@shared/auth/current-user.decorator";
import { JwtAuthGuard } from "@shared/auth/jwt-auth.guard";

import { AcceptBoardInvitationUseCase } from "../application/accept-board-invitation.use-case";
import { GetBoardInvitationUseCase } from "../application/get-board-invitation.use-case";
import { BoardInvitationPresenter } from "./presenters/board-invitation.presenter";

@Controller("board-invitations")
export class BoardInvitationsController {
  constructor(
    private readonly getInvitation: GetBoardInvitationUseCase,
    private readonly acceptInvitation: AcceptBoardInvitationUseCase,
  ) {}

  @Get(":token")
  async findOne(@Param("token") token: string) {
    return BoardInvitationPresenter.toHTTP(
      await this.getInvitation.execute({ token }),
    );
  }

  @Post(":token/accept")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async accept(
    @CurrentUser() user: AuthenticatedUser,
    @Param("token") token: string,
  ) {
    return BoardInvitationPresenter.toAcceptedHTTP(
      await this.acceptInvitation.execute({
        token,
        currentUserId: user.id,
        currentUserEmail: user.email,
      }),
    );
  }
}
