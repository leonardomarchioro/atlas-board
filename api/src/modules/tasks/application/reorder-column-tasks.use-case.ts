import { Injectable } from "@nestjs/common";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import { InvalidTaskPositionError } from "../errors/invalid-task-position.error";
import { TaskAccessService } from "../services/task-access.service";
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
  ) {}
  async execute(input: ReorderColumnTasksInput): Promise<void> {
    await this.access.requireBoardAccess(input.boardId, input.currentUserId);
    await this.access.requireColumn(input.boardId, input.columnId);
    await this.prisma.$transaction(async (tx) => {
      const tasks = await tx.task.findMany({
        where: { columnId: input.columnId },
        select: { id: true },
      });
      const existing = new Set(tasks.map(({ id }) => id));
      if (
        input.taskIds.length !== tasks.length ||
        new Set(input.taskIds).size !== input.taskIds.length ||
        input.taskIds.some((id) => !existing.has(id))
      )
        throw new InvalidTaskPositionError();
      await tx.task.updateMany({
        where: { columnId: input.columnId },
        data: { position: { increment: tasks.length } },
      });
      for (const [position, id] of input.taskIds.entries())
        await tx.task.update({ where: { id }, data: { position } });
    });
  }
}
