import { Injectable } from "@nestjs/common";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import { TaskChecklistItemNotFoundError } from "../errors/task-checklist-item-not-found.error";
import {
  TaskDetails,
  taskDetailsSelect,
} from "../presentation/selects/task-details.select";
import { TaskAccessService } from "../services/task-access.service";
export interface ReorderChecklistItemsInput {
  taskId: string;
  currentUserId: string;
  checklistItemIds: string[];
}
@Injectable()
export class ReorderChecklistItemsUseCase implements UseCase<
  ReorderChecklistItemsInput,
  TaskDetails
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: TaskAccessService,
  ) {}
  async execute(input: ReorderChecklistItemsInput): Promise<TaskDetails> {
    await this.access.requireTaskAccess(input.taskId, input.currentUserId);
    return this.prisma.$transaction(async (tx) => {
      const items = await tx.taskChecklistItem.findMany({
        where: { taskId: input.taskId },
        select: { id: true },
      });
      const existing = new Set(items.map(({ id }) => id));
      if (
        input.checklistItemIds.length !== items.length ||
        new Set(input.checklistItemIds).size !==
          input.checklistItemIds.length ||
        input.checklistItemIds.some((id) => !existing.has(id))
      )
        throw new TaskChecklistItemNotFoundError();
      await tx.taskChecklistItem.updateMany({
        where: { taskId: input.taskId },
        data: { position: { increment: items.length } },
      });
      for (const [position, id] of input.checklistItemIds.entries())
        await tx.taskChecklistItem.update({
          where: { id },
          data: { position },
        });
      return tx.task.findUniqueOrThrow({
        where: { id: input.taskId },
        select: taskDetailsSelect,
      });
    });
  }
}
