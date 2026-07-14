import { Injectable } from "@nestjs/common";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import { InvalidTaskPositionError } from "../errors/invalid-task-position.error";
import {
  TaskDetails,
  taskDetailsSelect,
} from "../presentation/selects/task-details.select";
import { TaskAccessService } from "../services/task-access.service";
export interface MoveTaskInput {
  taskId: string;
  currentUserId: string;
  columnId: string;
  position: number;
}
@Injectable()
export class MoveTaskUseCase implements UseCase<MoveTaskInput, TaskDetails> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: TaskAccessService,
  ) {}
  async execute(input: MoveTaskInput): Promise<TaskDetails> {
    const task = await this.access.requireTaskAccess(
      input.taskId,
      input.currentUserId,
    );
    await this.access.requireColumn(task.boardId, input.columnId);
    const count = await this.prisma.task.count({
      where: { columnId: input.columnId },
    });
    const max = input.columnId === task.columnId ? count - 1 : count;
    if (input.position < 0 || input.position > max)
      throw new InvalidTaskPositionError();
    if (input.columnId === task.columnId && input.position === task.position)
      return this.prisma.task.findUniqueOrThrow({
        where: { id: task.id },
        select: taskDetailsSelect,
      });
    return this.prisma.$transaction(async (tx) => {
      await tx.task.update({ where: { id: task.id }, data: { position: -1 } });
      if (input.columnId === task.columnId) {
        if (input.position < task.position) {
          const affected = await tx.task.findMany({
            where: {
              columnId: task.columnId,
              position: { gte: input.position, lt: task.position },
            },
            orderBy: { position: "desc" },
            select: { id: true, position: true },
          });
          for (const item of affected)
            await tx.task.update({
              where: { id: item.id },
              data: { position: item.position + 1 },
            });
        } else {
          const affected = await tx.task.findMany({
            where: {
              columnId: task.columnId,
              position: { gt: task.position, lte: input.position },
            },
            orderBy: { position: "asc" },
            select: { id: true, position: true },
          });
          for (const item of affected)
            await tx.task.update({
              where: { id: item.id },
              data: { position: item.position - 1 },
            });
        }
      } else {
        const source = await tx.task.findMany({
          where: { columnId: task.columnId, position: { gt: task.position } },
          orderBy: { position: "asc" },
          select: { id: true, position: true },
        });
        for (const item of source)
          await tx.task.update({
            where: { id: item.id },
            data: { position: item.position - 1 },
          });
        const target = await tx.task.findMany({
          where: {
            columnId: input.columnId,
            position: { gte: input.position },
          },
          orderBy: { position: "desc" },
          select: { id: true, position: true },
        });
        for (const item of target)
          await tx.task.update({
            where: { id: item.id },
            data: { position: item.position + 1 },
          });
      }
      return tx.task.update({
        where: { id: task.id },
        data: { columnId: input.columnId, position: input.position },
        select: taskDetailsSelect,
      });
    });
  }
}
