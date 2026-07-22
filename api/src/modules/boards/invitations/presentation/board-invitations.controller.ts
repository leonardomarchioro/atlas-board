import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import type { AuthenticatedUser } from "@shared/auth/authenticated-user.interface";
import { CurrentUser } from "@shared/auth/current-user.decorator";
import { JwtAuthGuard } from "@shared/auth/jwt-auth.guard";

import { AcceptBoardInvitationUseCase } from "../application/accept-board-invitation.use-case";
import { GetBoardInvitationUseCase } from "../application/get-board-invitation.use-case";
import { BoardInvitationPresenter } from "./presenters/board-invitation.presenter";

@Controller("board-invitations")
@ApiTags("Board Invitations")
export class BoardInvitationsController {
  constructor(
    private readonly getInvitation: GetBoardInvitationUseCase,
    private readonly acceptInvitation: AcceptBoardInvitationUseCase,
  ) {}

  @Get(":token")
  @ApiOperation({ summary: "Consulta os dados públicos de um convite" })
  @ApiOkResponse({
    schema: {
      example: {
        board: {
          id: "board-id",
          name: "Projeto Atlas",
          description: "Desenvolvimento da plataforma.",
          membersCount: 3,
          members: [{ id: "user-id", name: "Leonardo", avatarUrl: null }],
        },
        invitedEmail: "usuario@example.com",
        role: "COLLABORATOR",
        status: "PENDING",
        invitedBy: { id: "user-id", name: "Leonardo", avatarUrl: null },
        expiresAt: "2026-07-29T12:00:00.000Z",
        acceptedAt: null,
        isExpired: false,
        canAccept: true,
      },
    },
  })
  @ApiNotFoundResponse({ description: "Convite inválido ou indisponível." })
  async findOne(@Param("token") token: string) {
    return BoardInvitationPresenter.toHTTP(
      await this.getInvitation.execute({ token }),
    );
  }

  @Post(":token/accept")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Aceita um convite para o usuário autenticado" })
  @ApiOkResponse({ description: "Convite aceito e vínculo ativado." })
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
