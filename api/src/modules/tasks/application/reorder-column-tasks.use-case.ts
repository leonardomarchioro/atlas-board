import { Injectable } from "@nestjs/common";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import { InvalidTaskPositionError } from "../errors/invalid-task-position.error";
import { TaskAccessService } from "../services/task-access.service";
import { DomainNotificationsService } from "@modules/notifications/application/domain-notifications.service";
export interface ReorderColumnTasksInput {
  boardId: string;
  columnId: string;
  currentUserId: string;
  taskIds: string[];
}
@Injectable()
export class ReorderColumnTasksUseCase implements UseCase<ReorderColumnTasksInput> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: TaskAccessService,
    private readonly notifications: DomainNotificationsService,
  ) {}
  async execute(input: ReorderColumnTasksInput): Promise<void> {
    await this.access.requireBoardAccess(input.boardId, input.currentUserId);
    await this.access.requireColumn(input.boardId, input.columnId);
    const changedTaskIds = await this.prisma.$transaction(async (tx) => {
      const tasks = await tx.task.findMany({
        where: { columnId: input.columnId },
        select: { id: true, position: true },
      });
      const existing = new Set(tasks.map(({ id }) => id));
      if (
        input.taskIds.length !== tasks.length ||
        new Set(input.taskIds).size !== input.taskIds.length ||
        input.taskIds.some((id) => !existing.has(id))
      )
        throw new InvalidTaskPositionError();
      const previousPositionById = new Map(
        tasks.map(({ id, position }) => [id, position]),
      );
      const changed = input.taskIds.filter(
        (id, position) => previousPositionById.get(id) !== position,
      );
      if (changed.length === 0) return changed;
      await tx.task.updateMany({
        where: { columnId: input.columnId },
        data: { position: { increment: tasks.length } },
      });
      for (const [position, id] of input.taskIds.entries())
        await tx.task.update({ where: { id }, data: { position } });
      return changed;
    });
    for (const taskId of changedTaskIds) {
      await this.notifications.taskMoved({
        actorUserId: input.currentUserId,
        taskId,
        fromColumnId: input.columnId,
        toColumnId: input.columnId,
      });
    }
  }
}
