import { Injectable } from "@nestjs/common";

import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";

import { TaskAccessService } from "../../services/task-access.service";
import { TaskCommentAccessDeniedError } from "../errors/task-comment-access-denied.error";
import { TaskCommentNotFoundError } from "../errors/task-comment-not-found.error";

export interface DeleteTaskCommentInput {
  taskId: string;
  commentId: string;
  currentUserId: string;
}

@Injectable()
export class DeleteTaskCommentUseCase implements UseCase<DeleteTaskCommentInput> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: TaskAccessService,
  ) {}

  async execute(input: DeleteTaskCommentInput): Promise<void> {
    await this.access.requireTaskAccess(input.taskId, input.currentUserId);
    const comment = await this.prisma.taskComment.findFirst({
      where: { id: input.commentId, taskId: input.taskId },
      select: { id: true, authorId: true },
    });
    if (!comment) throw new TaskCommentNotFoundError();
    if (comment.authorId !== input.currentUserId) {
      throw new TaskCommentAccessDeniedError();
    }
    await this.prisma.taskComment.delete({ where: { id: comment.id } });
  }
}
