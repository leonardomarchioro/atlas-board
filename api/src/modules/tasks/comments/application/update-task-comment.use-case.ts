import { Injectable } from "@nestjs/common";

import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";

import { TaskAccessService } from "../../services/task-access.service";
import { TaskCommentAccessDeniedError } from "../errors/task-comment-access-denied.error";
import { TaskCommentNotFoundError } from "../errors/task-comment-not-found.error";
import {
  TaskCommentWithAuthor,
  taskCommentSelect,
} from "../presentation/selects/task-comment.select";

export interface UpdateTaskCommentInput {
  taskId: string;
  commentId: string;
  currentUserId: string;
  content: string;
}

@Injectable()
export class UpdateTaskCommentUseCase implements UseCase<
  UpdateTaskCommentInput,
  TaskCommentWithAuthor
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: TaskAccessService,
  ) {}

  async execute(input: UpdateTaskCommentInput): Promise<TaskCommentWithAuthor> {
    await this.access.requireTaskAccess(input.taskId, input.currentUserId);
    const comment = await this.prisma.taskComment.findFirst({
      where: { id: input.commentId, taskId: input.taskId },
      select: { id: true, authorId: true },
    });
    if (!comment) throw new TaskCommentNotFoundError();
    if (comment.authorId !== input.currentUserId) {
      throw new TaskCommentAccessDeniedError();
    }
    const content = input.content.trim();
    if (!content) {
      throw new AppError(
        "O comentário não pode estar vazio.",
        ErrorCode.VALIDATION_ERROR,
      );
    }
    return this.prisma.taskComment.update({
      where: { id: comment.id },
      data: { content },
      select: taskCommentSelect,
    });
  }
}
