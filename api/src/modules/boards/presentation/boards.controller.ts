import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import type { AuthenticatedUser } from "@shared/auth/authenticated-user.interface";
import { CurrentUser } from "@shared/auth/current-user.decorator";
import { JwtAuthGuard } from "@shared/auth/jwt-auth.guard";
import { InviteBoardMemberUseCase } from "../invitations/application/invite-board-member.use-case";
import { CreateBoardUseCase } from "../application/create-board.use-case";
import { DeleteBoardUseCase } from "../application/delete-board.use-case";
import { GetBoardByIdUseCase } from "../application/get-board-by-id.use-case";
import { ListBoardMembersUseCase } from "../application/list-board-members.use-case";
import { ListUserBoardsUseCase } from "../application/list-user-boards.use-case";
import { RemoveBoardMemberUseCase } from "../application/remove-board-member.use-case";
import { UpdateBoardUseCase } from "../application/update-board.use-case";
import { CreateBoardDto } from "./dto/create-board.dto";
import { InviteBoardMemberDto } from "./dto/invite-board-member.dto";
import { UpdateBoardDto } from "./dto/update-board.dto";
import { BoardMemberPresenter } from "./presenters/board-member.presenter";
import { BoardPresenter } from "./presenters/board.presenter";

@Controller("boards")
@UseGuards(JwtAuthGuard)
@ApiTags("Boards")
@ApiBearerAuth()
export class BoardsController {
  constructor(
    private readonly createBoard: CreateBoardUseCase,
    private readonly listBoards: ListUserBoardsUseCase,
    private readonly getBoard: GetBoardByIdUseCase,
    private readonly updateBoard: UpdateBoardUseCase,
    private readonly deleteBoard: DeleteBoardUseCase,
    private readonly listMembers: ListBoardMembersUseCase,
    private readonly removeMember: RemoveBoardMemberUseCase,
    private readonly inviteMember: InviteBoardMemberUseCase,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateBoardDto,
  ) {
    const board = await this.createBoard.execute({
      userId: user.id,
      userEmail: user.email,
      name: body.name,
      description: body.description,
      columns: body.columns,
      memberEmails: body.memberEmails,
    });
    return BoardPresenter.toDetails(board, "ADMIN");
  }

  @Get()
  @ApiOperation({
    summary: "Lista os boards do usuário com dados resumidos da Dashboard",
  })
  @ApiOkResponse({
    schema: {
      example: [
        {
          id: "board-id",
          name: "Projeto Atlas",
          description: "Desenvolvimento da plataforma.",
          role: "ADMIN",
          members: [
            {
              id: "member-id",
              role: "ADMIN",
              user: {
                id: "user-id",
                name: "Leonardo",
                avatarUrl: null,
              },
            },
          ],
          membersCount: 1,
          tasksCount: 12,
          createdAt: "2026-07-22T12:00:00.000Z",
          updatedAt: "2026-07-22T12:00:00.000Z",
        },
      ],
    },
  })
  async list(@CurrentUser() user: AuthenticatedUser) {
    const boards = await this.listBoards.execute({ userId: user.id });
    return boards.map(({ board, role }) =>
      BoardPresenter.toSummary(board, role),
    );
  }

  @Get(":boardId")
  @ApiOperation({ summary: "Obtém os detalhes do board para um membro ativo" })
  @ApiOkResponse({
    schema: {
      example: {
        id: "board-id",
        name: "Projeto Atlas",
        description: "Desenvolvimento da plataforma.",
        role: "ADMIN",
        createdBy: { id: "user-id", name: "Leonardo", avatarUrl: null },
        members: [
          {
            id: "member-id",
            role: "ADMIN",
            user: { id: "user-id", name: "Leonardo", avatarUrl: null },
          },
        ],
        columns: [{ id: "column-id", name: "Backlog", position: 0 }],
        createdAt: "2026-07-22T12:00:00.000Z",
        updatedAt: "2026-07-22T12:00:00.000Z",
      },
    },
  })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param("boardId", ParseUUIDPipe) boardId: string,
  ) {
    const result = await this.getBoard.execute({
      boardId,
      currentUserId: user.id,
    });
    return BoardPresenter.toDetails(result.board, result.role);
  }

  @Patch(":boardId")
  @ApiOperation({
    summary: "Atualiza as informações de um board",
    description: "Disponível somente para membros ADMIN e ACTIVE.",
  })
  @ApiOkResponse({ description: "Board atualizado com sucesso." })
  @ApiBadRequestResponse({ description: "Dados inválidos." })
  @ApiForbiddenResponse({
    description: "Usuário não é administrador ativo do board.",
  })
  @ApiNotFoundResponse({ description: "Board não encontrado." })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("boardId", ParseUUIDPipe) boardId: string,
    @Body() body: UpdateBoardDto,
  ) {
    const board = await this.updateBoard.execute({
      boardId,
      currentUserId: user.id,
      name: body.name,
      description: body.description,
      column: body.column,
    });
    return BoardPresenter.toDetails(board, "ADMIN");
  }

  @Delete(":boardId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Exclui permanentemente um board",
    description:
      "Disponível para membros ADMIN e ACTIVE. Exclui também os recursos dependentes do board.",
  })
  @ApiNoContentResponse({ description: "Board excluído com sucesso." })
  @ApiForbiddenResponse({
    description: "Usuário não é administrador ativo do board.",
  })
  @ApiNotFoundResponse({ description: "Board não encontrado." })
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param("boardId", ParseUUIDPipe) boardId: string,
  ): Promise<void> {
    await this.deleteBoard.execute({ boardId, currentUserId: user.id });
  }

  @Post(":boardId/invitations")
  @ApiOperation({
    summary: "Convida um colaborador para o board",
    description: "Disponível somente para membros ADMIN e ACTIVE.",
  })
  @ApiCreatedResponse({ description: "Convite criado." })
  @ApiBadRequestResponse({ description: "E-mail inválido." })
  @ApiForbiddenResponse({
    description: "Usuário não é administrador ativo.",
  })
  @ApiNotFoundResponse({ description: "Board não encontrado." })
  @ApiConflictResponse({
    description: "Membro ou convite válido já existente.",
  })
  async invite(
    @CurrentUser() user: AuthenticatedUser,
    @Param("boardId", ParseUUIDPipe) boardId: string,
    @Body() body: InviteBoardMemberDto,
  ) {
    return BoardMemberPresenter.toHTTP(
      await this.inviteMember.execute({
        boardId,
        currentUserId: user.id,
        currentUserEmail: user.email,
        email: body.email,
      }),
    );
  }

  @Get(":boardId/members")
  async members(
    @CurrentUser() user: AuthenticatedUser,
    @Param("boardId", ParseUUIDPipe) boardId: string,
  ) {
    const members = await this.listMembers.execute({
      boardId,
      currentUserId: user.id,
    });
    return members.map(BoardMemberPresenter.toHTTP);
  }

  @Delete(":boardId/members/:memberId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param("boardId", ParseUUIDPipe) boardId: string,
    @Param("memberId", ParseUUIDPipe) memberId: string,
  ): Promise<void> {
    await this.removeMember.execute({
      boardId,
      memberId,
      currentUserId: user.id,
    });
  }
}
