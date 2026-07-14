import { Injectable } from "@nestjs/common";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import { TaskChecklistItemNotFoundError } from "../errors/task-checklist-item-not-found.error";
import {
  TaskDetails,
  taskDetailsSelect,
} from "../presentation/selects/task-details.select";
import { TaskAccessService } from "../services/task-access.service";
export interface DeleteChecklistItemInput {
  taskId: string;
  checklistItemId: string;
  currentUserId: string;
}
@Injectable()
export class DeleteChecklistItemUseCase implements UseCase<
  DeleteChecklistItemInput,
  TaskDetails
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: TaskAccessService,
  ) {}
  async execute(input: DeleteChecklistItemInput): Promise<TaskDetails> {
    await this.access.requireTaskAccess(input.taskId, input.currentUserId);
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.taskChecklistItem.findFirst({
        where: { id: input.checklistItemId, taskId: input.taskId },
        select: { id: true, position: true },
      });
      if (!item) throw new TaskChecklistItemNotFoundError();
      await tx.taskChecklistItem.delete({ where: { id: item.id } });
      const following = await tx.taskChecklistItem.findMany({
        where: { taskId: input.taskId, position: { gt: item.position } },
        orderBy: { position: "asc" },
        select: { id: true, position: true },
      });
      for (const other of following)
        await tx.taskChecklistItem.update({
          where: { id: other.id },
          data: { position: other.position - 1 },
        });
      return tx.task.findUniqueOrThrow({
        where: { id: input.taskId },
        select: taskDetailsSelect,
      });
    });
  }
}
