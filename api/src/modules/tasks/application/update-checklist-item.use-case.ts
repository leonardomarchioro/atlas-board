import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";
import { TaskChecklistItemNotFoundError } from "../errors/task-checklist-item-not-found.error";
import {
  TaskDetails,
  taskDetailsSelect,
} from "../presentation/selects/task-details.select";
import { TaskAccessService } from "../services/task-access.service";
export interface UpdateChecklistItemInput {
  taskId: string;
  checklistItemId: string;
  currentUserId: string;
  title?: string;
  isCompleted?: boolean;
}
@Injectable()
export class UpdateChecklistItemUseCase implements UseCase<
  UpdateChecklistItemInput,
  TaskDetails
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: TaskAccessService,
  ) {}
  async execute(input: UpdateChecklistItemInput): Promise<TaskDetails> {
    await this.access.requireTaskAccess(input.taskId, input.currentUserId);
    const item = await this.prisma.taskChecklistItem.findFirst({
      where: { id: input.checklistItemId, taskId: input.taskId },
      select: { id: true },
    });
    if (!item) throw new TaskChecklistItemNotFoundError();
    if (input.title !== undefined && !input.title.trim())
      throw new AppError(
        "O título do item não pode ser vazio.",
        ErrorCode.VALIDATION_ERROR,
      );
    const data: Prisma.TaskChecklistItemUpdateInput = {};
    if (input.title !== undefined) data.title = input.title.trim();
    if (input.isCompleted !== undefined) data.isCompleted = input.isCompleted;
    await this.prisma.taskChecklistItem.update({
      where: { id: input.checklistItemId },
      data,
    });
    return this.prisma.task.findUniqueOrThrow({
      where: { id: input.taskId },
      select: taskDetailsSelect,
    });
  }
}
