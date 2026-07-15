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
export class TaskCommentsController {
  constructor(
    private readonly createComment: CreateTaskCommentUseCase,
    private readonly listComments: ListTaskCommentsUseCase,
    private readonly updateComment: UpdateTaskCommentUseCase,
    private readonly deleteComment: DeleteTaskCommentUseCase,
  ) {}

  @Post()
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
