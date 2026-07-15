import { Injectable } from "@nestjs/common";

import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";

import { TaskAccessService } from "../../services/task-access.service";
import {
  TaskCommentWithAuthor,
  taskCommentSelect,
} from "../presentation/selects/task-comment.select";

export interface ListTaskCommentsInput {
  taskId: string;
  currentUserId: string;
}

@Injectable()
export class ListTaskCommentsUseCase implements UseCase<
  ListTaskCommentsInput,
  TaskCommentWithAuthor[]
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: TaskAccessService,
  ) {}

  async execute(
    input: ListTaskCommentsInput,
  ): Promise<TaskCommentWithAuthor[]> {
    await this.access.requireTaskAccess(input.taskId, input.currentUserId);
    return this.prisma.taskComment.findMany({
      where: { taskId: input.taskId },
      select: taskCommentSelect,
      orderBy: { createdAt: "asc" },
    });
  }
}
