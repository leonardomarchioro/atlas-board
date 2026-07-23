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
  Put,
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
import { AddChecklistItemUseCase } from "../application/add-checklist-item.use-case";
import { CreateTagUseCase } from "../application/create-tag.use-case";
import { CreateTaskUseCase } from "../application/create-task.use-case";
import { DeleteChecklistItemUseCase } from "../application/delete-checklist-item.use-case";
import { DeleteTagUseCase } from "../application/delete-tag.use-case";
import { DeleteTaskUseCase } from "../application/delete-task.use-case";
import { GetTaskByIdUseCase } from "../application/get-task-by-id.use-case";
import { ListBoardTagsUseCase } from "../application/list-board-tags.use-case";
import { ListBoardTasksUseCase } from "../application/list-board-tasks.use-case";
import { MoveTaskUseCase } from "../application/move-task.use-case";
import { ReorderChecklistItemsUseCase } from "../application/reorder-checklist-items.use-case";
import { ReorderColumnTasksUseCase } from "../application/reorder-column-tasks.use-case";
import { UpdateChecklistItemUseCase } from "../application/update-checklist-item.use-case";
import { UpdateTagUseCase } from "../application/update-tag.use-case";
import { UpdateTaskSharedUsersUseCase } from "../application/update-task-shared-users.use-case";
import { UpdateTaskUseCase } from "../application/update-task.use-case";
import { AddChecklistItemDto } from "./dto/add-checklist-item.dto";
import { CreateTagDto } from "./dto/create-tag.dto";
import { CreateTaskDto } from "./dto/create-task.dto";
import { MoveTaskDto } from "./dto/move-task.dto";
import { ReorderChecklistItemsDto } from "./dto/reorder-checklist-items.dto";
import { ReorderColumnTasksDto } from "./dto/reorder-column-tasks.dto";
import { UpdateChecklistItemDto } from "./dto/update-checklist-item.dto";
import { UpdateTagDto } from "./dto/update-tag.dto";
import { UpdateTaskSharedUsersDto } from "./dto/update-task-shared-users.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { TagPresenter } from "./presenters/tag.presenter";
import { TaskPresenter } from "./presenters/task.presenter";

@Controller()
@UseGuards(JwtAuthGuard)
@ApiTags("Tasks")
@ApiBearerAuth()
export class TasksController {
  constructor(
    private readonly createTask: CreateTaskUseCase,
    private readonly getTask: GetTaskByIdUseCase,
    private readonly listTasks: ListBoardTasksUseCase,
    private readonly updateTask: UpdateTaskUseCase,
    private readonly deleteTask: DeleteTaskUseCase,
    private readonly moveTask: MoveTaskUseCase,
    private readonly reorderTasks: ReorderColumnTasksUseCase,
    private readonly updateSharedUsers: UpdateTaskSharedUsersUseCase,
    private readonly createTag: CreateTagUseCase,
    private readonly listTags: ListBoardTagsUseCase,
    private readonly updateTag: UpdateTagUseCase,
    private readonly deleteTag: DeleteTagUseCase,
    private readonly addChecklistItem: AddChecklistItemUseCase,
    private readonly updateChecklistItem: UpdateChecklistItemUseCase,
    private readonly deleteChecklistItem: DeleteChecklistItemUseCase,
    private readonly reorderChecklist: ReorderChecklistItemsUseCase,
  ) {}

  @Post("boards/:boardId/tasks")
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Param("boardId", ParseUUIDPipe) boardId: string,
    @Body() body: CreateTaskDto,
  ) {
    const task = await this.createTask.execute({
      boardId,
      currentUserId: user.id,
      columnId: body.columnId,
      title: body.title,
      description: body.description,
      priority: body.priority,
      assigneeId: body.assigneeId,
      sharedUserIds: body.sharedUserIds,
      dueDate:
        body.dueDate === undefined
          ? undefined
          : body.dueDate === null
            ? null
            : new Date(body.dueDate),
      tagIds: body.tagIds,
      checklist: body.checklist,
    });
    return TaskPresenter.toDetails(task);
  }

  @Get("boards/:boardId/tasks")
  @ApiOperation({ summary: "Lista os resumos das tarefas de um board" })
  @ApiOkResponse({
    schema: {
      example: [
        {
          id: "task-id",
          boardId: "board-id",
          columnId: "column-id",
          title: "Implementar Kanban",
          description: "Construir a visualização principal.",
          priority: "HIGH",
          position: 0,
          dueDate: null,
          assignee: { id: "user-id", name: "Leonardo", avatarUrl: null },
          sharedUsers: [],
          tags: [{ id: "tag-id", name: "Frontend", color: "#2563EB" }],
          checklistCount: 3,
          completedChecklistCount: 1,
          commentsCount: 2,
        },
      ],
    },
  })
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Param("boardId", ParseUUIDPipe) boardId: string,
  ) {
    return (
      await this.listTasks.execute({ boardId, currentUserId: user.id })
    ).map(TaskPresenter.toSummary);
  }

  @Get("tasks/:taskId")
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param("taskId", ParseUUIDPipe) taskId: string,
  ) {
    return TaskPresenter.toDetails(
      await this.getTask.execute({ taskId, currentUserId: user.id }),
    );
  }

  @Patch("tasks/:taskId")
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("taskId", ParseUUIDPipe) taskId: string,
    @Body() body: UpdateTaskDto,
  ) {
    const task = await this.updateTask.execute({
      taskId,
      currentUserId: user.id,
      title: body.title,
      description: body.description,
      priority: body.priority,
      assigneeId: body.assigneeId,
      dueDate:
        body.dueDate === undefined
          ? undefined
          : body.dueDate === null
            ? null
            : new Date(body.dueDate),
      tagIds: body.tagIds,
    });
    return TaskPresenter.toDetails(task);
  }

  @Delete("tasks/:taskId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param("taskId", ParseUUIDPipe) taskId: string,
  ): Promise<void> {
    await this.deleteTask.execute({ taskId, currentUserId: user.id });
  }

  @Patch("tasks/:taskId/move")
  async move(
    @CurrentUser() user: AuthenticatedUser,
    @Param("taskId", ParseUUIDPipe) taskId: string,
    @Body() body: MoveTaskDto,
  ) {
    return TaskPresenter.toDetails(
      await this.moveTask.execute({
        taskId,
        currentUserId: user.id,
        columnId: body.columnId,
        position: body.position,
      }),
    );
  }

  @Patch("boards/:boardId/columns/:columnId/tasks/reorder")
  @HttpCode(HttpStatus.NO_CONTENT)
  async reorder(
    @CurrentUser() user: AuthenticatedUser,
    @Param("boardId", ParseUUIDPipe) boardId: string,
    @Param("columnId", ParseUUIDPipe) columnId: string,
    @Body() body: ReorderColumnTasksDto,
  ): Promise<void> {
    await this.reorderTasks.execute({
      boardId,
      columnId,
      currentUserId: user.id,
      taskIds: body.taskIds,
    });
  }

  @Put("tasks/:taskId/shared-users")
  async sharedUsers(
    @CurrentUser() user: AuthenticatedUser,
    @Param("taskId", ParseUUIDPipe) taskId: string,
    @Body() body: UpdateTaskSharedUsersDto,
  ) {
    return TaskPresenter.toDetails(
      await this.updateSharedUsers.execute({
        taskId,
        currentUserId: user.id,
        sharedUserIds: body.sharedUserIds,
      }),
    );
  }

  @Post("boards/:boardId/tags")
  @ApiOperation({
    summary: "Cria uma tag no board",
    description: "Disponível somente para administradores ativos do board.",
  })
  @ApiCreatedResponse({
    description: "Tag criada.",
    schema: {
      example: {
        id: "tag-id",
        boardId: "board-id",
        name: "Backend",
        color: "#2563EB",
        tasksCount: 0,
        createdAt: "2026-07-23T12:00:00.000Z",
        updatedAt: "2026-07-23T12:00:00.000Z",
      },
    },
  })
  @ApiBadRequestResponse({ description: "Dados inválidos." })
  @ApiForbiddenResponse({ description: "Administrador ativo necessário." })
  @ApiNotFoundResponse({ description: "Board não encontrado." })
  @ApiConflictResponse({ description: "Nome de tag já utilizado no board." })
  async createBoardTag(
    @CurrentUser() user: AuthenticatedUser,
    @Param("boardId", ParseUUIDPipe) boardId: string,
    @Body() body: CreateTagDto,
  ) {
    return TagPresenter.toHTTP(
      await this.createTag.execute({
        boardId,
        currentUserId: user.id,
        name: body.name,
        color: body.color,
      }),
    );
  }

  @Get("boards/:boardId/tags")
  @ApiOperation({
    summary: "Lista as tags do board",
    description: "Disponível para membros ativos do board.",
  })
  @ApiOkResponse({
    description: "Tags do board com a quantidade de tarefas associadas.",
    schema: {
      example: [
        {
          id: "tag-id",
          boardId: "board-id",
          name: "Backend",
          color: "#2563EB",
          tasksCount: 4,
          createdAt: "2026-07-23T12:00:00.000Z",
          updatedAt: "2026-07-23T12:00:00.000Z",
        },
      ],
    },
  })
  @ApiForbiddenResponse({ description: "Membro ativo necessário." })
  @ApiNotFoundResponse({ description: "Board não encontrado." })
  async boardTags(
    @CurrentUser() user: AuthenticatedUser,
    @Param("boardId", ParseUUIDPipe) boardId: string,
  ) {
    return (
      await this.listTags.execute({ boardId, currentUserId: user.id })
    ).map(TagPresenter.toHTTP);
  }

  @Patch("boards/:boardId/tags/:tagId")
  @ApiOperation({
    summary: "Atualiza uma tag do board",
    description: "Disponível somente para administradores ativos do board.",
  })
  @ApiOkResponse({ description: "Tag atualizada." })
  @ApiBadRequestResponse({ description: "Dados inválidos." })
  @ApiForbiddenResponse({ description: "Administrador ativo necessário." })
  @ApiNotFoundResponse({ description: "Board ou tag não encontrado." })
  @ApiConflictResponse({ description: "Nome de tag já utilizado no board." })
  async updateBoardTag(
    @CurrentUser() user: AuthenticatedUser,
    @Param("boardId", ParseUUIDPipe) boardId: string,
    @Param("tagId", ParseUUIDPipe) tagId: string,
    @Body() body: UpdateTagDto,
  ) {
    return TagPresenter.toHTTP(
      await this.updateTag.execute({
        boardId,
        tagId,
        currentUserId: user.id,
        name: body.name,
        color: body.color,
      }),
    );
  }

  @Delete("boards/:boardId/tags/:tagId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Exclui uma tag do board",
    description:
      "Disponível somente para administradores ativos. Remove as associações, sem excluir tarefas.",
  })
  @ApiNoContentResponse({ description: "Tag excluída." })
  @ApiForbiddenResponse({ description: "Administrador ativo necessário." })
  @ApiNotFoundResponse({ description: "Board ou tag não encontrado." })
  async deleteBoardTag(
    @CurrentUser() user: AuthenticatedUser,
    @Param("boardId", ParseUUIDPipe) boardId: string,
    @Param("tagId", ParseUUIDPipe) tagId: string,
  ): Promise<void> {
    await this.deleteTag.execute({ boardId, tagId, currentUserId: user.id });
  }

  @Post("tasks/:taskId/checklist")
  async addItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param("taskId", ParseUUIDPipe) taskId: string,
    @Body() body: AddChecklistItemDto,
  ) {
    return TaskPresenter.toDetails(
      await this.addChecklistItem.execute({
        taskId,
        currentUserId: user.id,
        title: body.title,
        isCompleted: body.isCompleted,
      }),
    );
  }

  @Patch("tasks/:taskId/checklist/reorder")
  async reorderItems(
    @CurrentUser() user: AuthenticatedUser,
    @Param("taskId", ParseUUIDPipe) taskId: string,
    @Body() body: ReorderChecklistItemsDto,
  ) {
    return TaskPresenter.toDetails(
      await this.reorderChecklist.execute({
        taskId,
        currentUserId: user.id,
        checklistItemIds: body.checklistItemIds,
      }),
    );
  }

  @Patch("tasks/:taskId/checklist/:checklistItemId")
  async updateItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param("taskId", ParseUUIDPipe) taskId: string,
    @Param("checklistItemId", ParseUUIDPipe) checklistItemId: string,
    @Body() body: UpdateChecklistItemDto,
  ) {
    return TaskPresenter.toDetails(
      await this.updateChecklistItem.execute({
        taskId,
        checklistItemId,
        currentUserId: user.id,
        title: body.title,
        isCompleted: body.isCompleted,
      }),
    );
  }

  @Delete("tasks/:taskId/checklist/:checklistItemId")
  async deleteItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param("taskId", ParseUUIDPipe) taskId: string,
    @Param("checklistItemId", ParseUUIDPipe) checklistItemId: string,
  ) {
    return TaskPresenter.toDetails(
      await this.deleteChecklistItem.execute({
        taskId,
        checklistItemId,
        currentUserId: user.id,
      }),
    );
  }
}
