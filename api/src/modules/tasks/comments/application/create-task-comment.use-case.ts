import { Injectable } from "@nestjs/common";

import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";

import { TaskAccessService } from "../../services/task-access.service";
import { DomainNotificationsService } from "@modules/notifications/application/domain-notifications.service";
import {
  TaskCommentWithAuthor,
  taskCommentSelect,
} from "../presentation/selects/task-comment.select";

export interface CreateTaskCommentInput {
  taskId: string;
  currentUserId: string;
  content: string;
}

@Injectable()
export class CreateTaskCommentUseCase implements UseCase<
  CreateTaskCommentInput,
  TaskCommentWithAuthor
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: TaskAccessService,
    private readonly notifications: DomainNotificationsService,
  ) {}

  async execute(input: CreateTaskCommentInput): Promise<TaskCommentWithAuthor> {
    await this.access.requireTaskAccess(input.taskId, input.currentUserId);
    const content = input.content.trim();
    if (!content) {
      throw new AppError(
        "O comentário não pode estar vazio.",
        ErrorCode.VALIDATION_ERROR,
      );
    }
    const comment = await this.prisma.taskComment.create({
      data: {
        taskId: input.taskId,
        authorId: input.currentUserId,
        content,
      },
      select: taskCommentSelect,
    });
    await this.notifications.taskCommentCreated({
      actorUserId: input.currentUserId,
      taskId: input.taskId,
      commentId: comment.id,
    });
    return comment;
  }
}
