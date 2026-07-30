import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiGoneResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
  ApiTags,
} from "@nestjs/swagger";

import type { AuthenticatedUser } from "@shared/auth/authenticated-user.interface";
import { CurrentUser } from "@shared/auth/current-user.decorator";
import { JwtAuthGuard } from "@shared/auth/jwt-auth.guard";

import { AcceptBoardInvitationUseCase } from "../application/accept-board-invitation.use-case";
import { AcceptAuthenticatedBoardInvitationUseCase } from "../application/accept-authenticated-board-invitation.use-case";
import { GetAuthenticatedBoardInvitationUseCase } from "../application/get-authenticated-board-invitation.use-case";
import { GetBoardInvitationUseCase } from "../application/get-board-invitation.use-case";
import { BoardInvitationPresenter } from "./presenters/board-invitation.presenter";

@Controller("board-invitations")
@ApiTags("Board Invitations")
export class BoardInvitationsController {
  constructor(
    private readonly getInvitation: GetBoardInvitationUseCase,
    private readonly acceptInvitation: AcceptBoardInvitationUseCase,
    private readonly getAuthenticatedInvitation: GetAuthenticatedBoardInvitationUseCase,
    private readonly acceptAuthenticatedInvitation: AcceptAuthenticatedBoardInvitationUseCase,
  ) {}

  @Get(":invitationId/authenticated")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Consulta um convite do usuário autenticado pelo ID",
  })
  @ApiOkResponse({
    schema: {
      example: {
        id: "b906bb26-a72c-449e-9d95-0cf2ed4f0886",
        board: {
          id: "board-id",
          name: "Projeto Atlas",
          description: "Desenvolvimento da plataforma.",
        },
        email: "usuario@example.com",
        role: "COLLABORATOR",
        status: "PENDING",
        invitedBy: {
          id: "user-id",
          name: "Leonardo",
          avatarUrl: null,
        },
        createdAt: "2026-07-27T12:00:00.000Z",
        expiresAt: "2026-08-03T12:00:00.000Z",
        acceptedAt: null,
        isExpired: false,
        canAccept: true,
      },
    },
  })
  @ApiUnauthorizedResponse({ description: "Token ausente, inválido ou expirado." })
  @ApiForbiddenResponse({
    description: "O convite pertence a outro endereço de e-mail.",
  })
  @ApiNotFoundResponse({
    description: "Convite inexistente ou não pertencente ao usuário.",
  })
  @ApiUnprocessableEntityResponse({ description: "ID inválido." })
  async findAuthenticated(
    @CurrentUser() user: AuthenticatedUser,
    @Param(
      "invitationId",
      new ParseUUIDPipe({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    invitationId: string,
  ) {
    return BoardInvitationPresenter.toAuthenticatedHTTP(
      await this.getAuthenticatedInvitation.execute({
        invitationId,
        currentUserId: user.id,
        currentUserEmail: user.email,
      }),
    );
  }

  @Post(":invitationId/accept-authenticated")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Aceita um convite autenticado pelo ID",
  })
  @ApiOkResponse({
    description: "Convite aceito e vínculo ativado.",
  })
  @ApiUnauthorizedResponse({ description: "Token ausente, inválido ou expirado." })
  @ApiForbiddenResponse({
    description: "O convite pertence a outro endereço de e-mail.",
  })
  @ApiNotFoundResponse({
    description: "Convite inexistente ou não pertencente ao usuário.",
  })
  @ApiConflictResponse({
    description: "Convite já aceito por outro vínculo ou membership já existente.",
  })
  @ApiGoneResponse({ description: "Convite expirado." })
  @ApiUnprocessableEntityResponse({ description: "ID inválido." })
  async acceptAuthenticated(
    @CurrentUser() user: AuthenticatedUser,
    @Param(
      "invitationId",
      new ParseUUIDPipe({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    invitationId: string,
  ) {
    return BoardInvitationPresenter.toAcceptedHTTP(
      await this.acceptAuthenticatedInvitation.execute({
        invitationId,
        currentUserId: user.id,
        currentUserEmail: user.email,
      }),
    );
  }

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
