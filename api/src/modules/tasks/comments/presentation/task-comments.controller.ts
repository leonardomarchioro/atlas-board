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
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import type { AuthenticatedUser } from "@shared/auth/authenticated-user.interface";
import { CurrentUser } from "@shared/auth/current-user.decorator";
import { JwtAuthGuard } from "@shared/auth/jwt-auth.guard";

import { CreateTaskCommentUseCase } from "../application/create-task-comment.use-case";
import { DeleteTaskCommentUseCase } from "../application/delete-task-comment.use-case";
import { ListTaskCommentsUseCase } from "../application/list-task-comments.use-case";
import { UpdateTaskCommentUseCase } from "../application/update-task-comment.use-case";
import { CreateTaskCommentDto } from "./dto/create-task-comment.dto";
import { UpdateTaskCommentDto } from "./dto/update-task-comment.dto";
import {
  TaskCommentPresenter,
  TaskCommentResponse,
} from "./presenters/task-comment.presenter";

@Controller("tasks/:taskId/comments")
@UseGuards(JwtAuthGuard)
@ApiTags("Task Comments")
@ApiBearerAuth()
export class TaskCommentsController {
  constructor(
    private readonly createComment: CreateTaskCommentUseCase,
    private readonly listComments: ListTaskCommentsUseCase,
    private readonly updateComment: UpdateTaskCommentUseCase,
    private readonly deleteComment: DeleteTaskCommentUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: "Cria um comentário na tarefa" })
  @ApiCreatedResponse({ description: "Comentário criado." })
  @ApiForbiddenResponse({ description: "Membro ativo necessário." })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Param("taskId", ParseUUIDPipe) taskId: string,
    @Body() body: CreateTaskCommentDto,
  ): Promise<TaskCommentResponse> {
    const comment = await this.createComment.execute({
      taskId,
      currentUserId: user.id,
      content: body.content,
    });
    return TaskCommentPresenter.toHTTP(comment);
  }

  @Get()
  @ApiOperation({ summary: "Lista os comentários da tarefa" })
  @ApiOkResponse({ description: "Comentários em ordem de criação." })
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Param("taskId", ParseUUIDPipe) taskId: string,
  ): Promise<TaskCommentResponse[]> {
    const comments = await this.listComments.execute({
      taskId,
      currentUserId: user.id,
    });
    return comments.map(TaskCommentPresenter.toHTTP);
  }

  @Patch(":commentId")
  @ApiOperation({ summary: "Edita um comentário do usuário autenticado" })
  @ApiOkResponse({ description: "Comentário atualizado." })
  @ApiForbiddenResponse({ description: "Somente o autor pode editar." })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("taskId", ParseUUIDPipe) taskId: string,
    @Param("commentId", ParseUUIDPipe) commentId: string,
    @Body() body: UpdateTaskCommentDto,
  ): Promise<TaskCommentResponse> {
    const comment = await this.updateComment.execute({
      taskId,
      commentId,
      currentUserId: user.id,
      content: body.content,
    });
    return TaskCommentPresenter.toHTTP(comment);
  }

  @Delete(":commentId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Exclui um comentário do usuário autenticado" })
  @ApiNoContentResponse({ description: "Comentário excluído." })
  @ApiForbiddenResponse({ description: "Somente o autor pode excluir." })
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param("taskId", ParseUUIDPipe) taskId: string,
    @Param("commentId", ParseUUIDPipe) commentId: string,
  ): Promise<void> {
    await this.deleteComment.execute({
      taskId,
      commentId,
      currentUserId: user.id,
    });
  }
}
