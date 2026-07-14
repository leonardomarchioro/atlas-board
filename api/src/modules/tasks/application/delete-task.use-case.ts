import { Injectable } from "@nestjs/common";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import { TaskAccessService } from "../services/task-access.service";
export type DeleteTaskInput = { taskId: string; currentUserId: string };
@Injectable()
export class DeleteTaskUseCase implements UseCase<DeleteTaskInput> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: TaskAccessService,
  ) {}
  async execute({ taskId, currentUserId }: DeleteTaskInput): Promise<void> {
    const task = await this.access.requireTaskAccess(taskId, currentUserId);
    await this.prisma.$transaction(async (tx) => {
      await tx.task.delete({ where: { id: taskId } });
      const following = await tx.task.findMany({
        where: { columnId: task.columnId, position: { gt: task.position } },
        orderBy: { position: "asc" },
        select: { id: true, position: true },
      });
      for (const item of following)
        await tx.task.update({
          where: { id: item.id },
          data: { position: item.position - 1 },
        });
    });
  }
}
