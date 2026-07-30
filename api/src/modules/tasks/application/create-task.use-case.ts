import { Injectable } from "@nestjs/common";
import type { TaskPriority } from "@prisma/client";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";
import {
  TaskDetails,
  taskDetailsSelect,
} from "../presentation/selects/task-details.select";
import { TaskAccessService } from "../services/task-access.service";
import { DomainNotificationsService } from "@modules/notifications/application/domain-notifications.service";

export interface CreateTaskInput {
  boardId: string;
  columnId: string;
  currentUserId: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  assigneeId?: string | null;
  sharedUserIds?: string[];
  dueDate?: Date | null;
  tagIds?: string[];
  checklist?: Array<{ title: string; isCompleted?: boolean }>;
}

@Injectable()
export class CreateTaskUseCase implements UseCase<
  CreateTaskInput,
  TaskDetails
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: TaskAccessService,
    private readonly notifications: DomainNotificationsService,
  ) {}
  async execute(input: CreateTaskInput): Promise<TaskDetails> {
    await this.access.requireBoardAccess(input.boardId, input.currentUserId);
    await this.access.requireColumn(input.boardId, input.columnId);
    const title = input.title.trim();
    const description = input.description?.trim();
    const checklist = (input.checklist ?? []).map((item, position) => ({
      title: item.title.trim(),
      isCompleted: item.isCompleted ?? false,
      position,
    }));
    if (!title || checklist.some((item) => !item.title))
      throw new AppError(
        "O título da tarefa e dos itens de checklist não pode ser vazio.",
        ErrorCode.VALIDATION_ERROR,
      );
    const sharedUserIds = await this.access.requireActiveUsers(
      input.boardId,
      input.sharedUserIds ?? [],
    );
    if (input.assigneeId)
      await this.access.requireActiveUsers(input.boardId, [input.assigneeId]);
    const tagIds = await this.access.requireTags(
      input.boardId,
      input.tagIds ?? [],
    );

    const task = await this.prisma.$transaction(async (tx) => {
      const last = await tx.task.findFirst({
        where: { columnId: input.columnId },
        orderBy: { position: "desc" },
        select: { position: true },
      });
      const task = await tx.task.create({
        data: {
          boardId: input.boardId,
          columnId: input.columnId,
          createdById: input.currentUserId,
          title,
          description,
          priority: input.priority,
          assigneeId: input.assigneeId,
          dueDate: input.dueDate,
          position: (last?.position ?? -1) + 1,
        },
        select: { id: true },
      });
      if (sharedUserIds.length)
        await tx.taskSharedUser.createMany({
          data: sharedUserIds.map((userId) => ({ taskId: task.id, userId })),
        });
      if (tagIds.length)
        await tx.taskTag.createMany({
          data: tagIds.map((tagId) => ({ taskId: task.id, tagId })),
        });
      if (checklist.length)
        await tx.taskChecklistItem.createMany({
          data: checklist.map((item) => ({ ...item, taskId: task.id })),
        });
      return tx.task.findUniqueOrThrow({
        where: { id: task.id },
        select: taskDetailsSelect,
      });
    });
    await this.notifications.taskAssigned({
      recipientUserIds: [
        ...(input.assigneeId ? [input.assigneeId] : []),
        ...sharedUserIds,
      ],
      actorUserId: input.currentUserId,
      boardId: task.boardId,
      taskId: task.id,
      taskTitle: task.title,
    });
    return task;
  }
}
