import { Injectable } from "@nestjs/common";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";
import {
  TaskDetails,
  taskDetailsSelect,
} from "../presentation/selects/task-details.select";
import { TaskAccessService } from "../services/task-access.service";
export interface AddChecklistItemInput {
  taskId: string;
  currentUserId: string;
  title: string;
  isCompleted?: boolean;
}
@Injectable()
export class AddChecklistItemUseCase implements UseCase<
  AddChecklistItemInput,
  TaskDetails
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: TaskAccessService,
  ) {}
  async execute(input: AddChecklistItemInput): Promise<TaskDetails> {
    await this.access.requireTaskAccess(input.taskId, input.currentUserId);
    const title = input.title.trim();
    if (!title)
      throw new AppError(
        "O título do item não pode ser vazio.",
        ErrorCode.VALIDATION_ERROR,
      );
    return this.prisma.$transaction(async (tx) => {
      const last = await tx.taskChecklistItem.findFirst({
        where: { taskId: input.taskId },
        orderBy: { position: "desc" },
        select: { position: true },
      });
      await tx.taskChecklistItem.create({
        data: {
          taskId: input.taskId,
          title,
          isCompleted: input.isCompleted ?? false,
          position: (last?.position ?? -1) + 1,
        },
      });
      return tx.task.findUniqueOrThrow({
        where: { id: input.taskId },
        select: taskDetailsSelect,
      });
    });
  }
}
