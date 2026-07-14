import { Injectable } from "@nestjs/common";
import type { Prisma, TaskPriority } from "@prisma/client";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";
import {
  TaskDetails,
  taskDetailsSelect,
} from "../presentation/selects/task-details.select";
import { TaskAccessService } from "../services/task-access.service";
export interface UpdateTaskInput {
  taskId: string;
  currentUserId: string;
  title?: string;
  description?: string | null;
  priority?: TaskPriority;
  assigneeId?: string | null;
  dueDate?: Date | null;
  tagIds?: string[];
}
@Injectable()
export class UpdateTaskUseCase implements UseCase<
  UpdateTaskInput,
  TaskDetails
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: TaskAccessService,
  ) {}
  async execute(input: UpdateTaskInput): Promise<TaskDetails> {
    const task = await this.access.requireTaskAccess(
      input.taskId,
      input.currentUserId,
    );
    if (input.title !== undefined && !input.title.trim())
      throw new AppError(
        "O título da tarefa não pode ser vazio.",
        ErrorCode.VALIDATION_ERROR,
      );
    if (input.assigneeId)
      await this.access.requireActiveUsers(task.boardId, [input.assigneeId]);
    const tagIds =
      input.tagIds === undefined
        ? undefined
        : await this.access.requireTags(task.boardId, input.tagIds);
    return this.prisma.$transaction(async (tx) => {
      const data: Prisma.TaskUpdateInput = {};
      if (input.title !== undefined) data.title = input.title.trim();
      if (input.description !== undefined)
        data.description = input.description?.trim() ?? null;
      if (input.priority !== undefined) data.priority = input.priority;
      if (input.assigneeId !== undefined)
        data.assignee = input.assigneeId
          ? { connect: { id: input.assigneeId } }
          : { disconnect: true };
      if (input.dueDate !== undefined) data.dueDate = input.dueDate;
      await tx.task.update({ where: { id: input.taskId }, data });
      if (tagIds !== undefined) {
        await tx.taskTag.deleteMany({ where: { taskId: input.taskId } });
        if (tagIds.length)
          await tx.taskTag.createMany({
            data: tagIds.map((tagId) => ({ taskId: input.taskId, tagId })),
          });
      }
      return tx.task.findUniqueOrThrow({
        where: { id: input.taskId },
        select: taskDetailsSelect,
      });
    });
  }
}
