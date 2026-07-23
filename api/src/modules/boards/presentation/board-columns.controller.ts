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
import { CreateBoardColumnUseCase } from "../application/create-board-column.use-case";
import { DeleteBoardColumnUseCase } from "../application/delete-board-column.use-case";
import { ListBoardColumnsUseCase } from "../application/list-board-columns.use-case";
import { ReorderBoardColumnsUseCase } from "../application/reorder-board-columns.use-case";
import { UpdateBoardColumnUseCase } from "../application/update-board-column.use-case";
import { CreateBoardColumnDto } from "./dto/create-board-column.dto";
import { ReorderBoardColumnsDto } from "./dto/reorder-board-columns.dto";
import { UpdateBoardColumnDto } from "./dto/update-board-column.dto";
import { BoardColumnManagementPresenter } from "./presenters/board-column-management.presenter";

@Controller("boards/:boardId/columns")
@UseGuards(JwtAuthGuard)
@ApiTags("Board Columns")
@ApiBearerAuth()
export class BoardColumnsController {
  constructor(
    private readonly listColumns: ListBoardColumnsUseCase,
    private readonly createColumn: CreateBoardColumnUseCase,
    private readonly updateColumn: UpdateBoardColumnUseCase,
    private readonly reorderColumns: ReorderBoardColumnsUseCase,
    private readonly deleteColumn: DeleteBoardColumnUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: "Lista as colunas do board",
    description: "Disponível somente para membros ADMIN e ACTIVE.",
  })
  @ApiOkResponse({ description: "Colunas ordenadas com tasksCount." })
  @ApiForbiddenResponse({ description: "Administrador ativo necessário." })
  @ApiNotFoundResponse({ description: "Board não encontrado." })
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Param("boardId", ParseUUIDPipe) boardId: string,
  ) {
    return (
      await this.listColumns.execute({ boardId, currentUserId: user.id })
    ).map(BoardColumnManagementPresenter.toHTTP);
  }

  @Post()
  @ApiOperation({
    summary: "Cria uma coluna no final do board",
    description: "Disponível somente para membros ADMIN e ACTIVE.",
  })
  @ApiCreatedResponse({ description: "Coluna criada." })
  @ApiBadRequestResponse({ description: "Dados inválidos." })
  @ApiForbiddenResponse({ description: "Administrador ativo necessário." })
  @ApiNotFoundResponse({ description: "Board não encontrado." })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Param("boardId", ParseUUIDPipe) boardId: string,
    @Body() body: CreateBoardColumnDto,
  ) {
    return BoardColumnManagementPresenter.toHTTP(
      await this.createColumn.execute({
        boardId,
        currentUserId: user.id,
        name: body.name,
      }),
    );
  }

  @Patch("reorder")
  @ApiOperation({
    summary: "Reordena todas as colunas do board",
    description: "Disponível somente para membros ADMIN e ACTIVE.",
  })
  @ApiOkResponse({ description: "Colunas reordenadas." })
  @ApiBadRequestResponse({ description: "Ordem inválida." })
  @ApiForbiddenResponse({ description: "Administrador ativo necessário." })
  @ApiNotFoundResponse({ description: "Board não encontrado." })
  async reorder(
    @CurrentUser() user: AuthenticatedUser,
    @Param("boardId", ParseUUIDPipe) boardId: string,
    @Body() body: ReorderBoardColumnsDto,
  ) {
    return (
      await this.reorderColumns.execute({
        boardId,
        currentUserId: user.id,
        columns: body.columns,
      })
    ).map(BoardColumnManagementPresenter.toHTTP);
  }

  @Patch(":columnId")
  @ApiOperation({
    summary: "Renomeia uma coluna do board",
    description: "Disponível somente para membros ADMIN e ACTIVE.",
  })
  @ApiOkResponse({ description: "Coluna atualizada." })
  @ApiBadRequestResponse({ description: "Dados inválidos." })
  @ApiForbiddenResponse({ description: "Administrador ativo necessário." })
  @ApiNotFoundResponse({ description: "Board ou coluna não encontrado." })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("boardId", ParseUUIDPipe) boardId: string,
    @Param("columnId", ParseUUIDPipe) columnId: string,
    @Body() body: UpdateBoardColumnDto,
  ) {
    return BoardColumnManagementPresenter.toHTTP(
      await this.updateColumn.execute({
        boardId,
        columnId,
        currentUserId: user.id,
        name: body.name,
      }),
    );
  }

  @Delete(":columnId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Exclui uma coluna vazia",
    description:
      "Disponível somente para membros ADMIN e ACTIVE. Nunca exclui tarefas.",
  })
  @ApiNoContentResponse({ description: "Coluna excluída." })
  @ApiForbiddenResponse({ description: "Administrador ativo necessário." })
  @ApiNotFoundResponse({ description: "Board ou coluna não encontrado." })
  @ApiConflictResponse({
    description: "Coluna possui tarefas ou é a última coluna do board.",
  })
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param("boardId", ParseUUIDPipe) boardId: string,
    @Param("columnId", ParseUUIDPipe) columnId: string,
  ): Promise<void> {
    await this.deleteColumn.execute({
      boardId,
      columnId,
      currentUserId: user.id,
    });
  }
}
