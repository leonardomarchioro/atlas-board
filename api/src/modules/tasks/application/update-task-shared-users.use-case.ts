import { Injectable } from "@nestjs/common";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import {
  TaskDetails,
  taskDetailsSelect,
} from "../presentation/selects/task-details.select";
import { TaskAccessService } from "../services/task-access.service";
export interface UpdateTaskSharedUsersInput {
  taskId: string;
  currentUserId: string;
  sharedUserIds: string[];
}
@Injectable()
export class UpdateTaskSharedUsersUseCase implements UseCase<
  UpdateTaskSharedUsersInput,
  TaskDetails
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: TaskAccessService,
  ) {}
  async execute(input: UpdateTaskSharedUsersInput): Promise<TaskDetails> {
    const task = await this.access.requireTaskAccess(
      input.taskId,
      input.currentUserId,
    );
    const ids = await this.access.requireActiveUsers(
      task.boardId,
      input.sharedUserIds,
    );
    return this.prisma.$transaction(async (tx) => {
      await tx.taskSharedUser.deleteMany({ where: { taskId: input.taskId } });
      if (ids.length)
        await tx.taskSharedUser.createMany({
          data: ids.map((userId) => ({ taskId: input.taskId, userId })),
        });
      return tx.task.findUniqueOrThrow({
        where: { id: input.taskId },
        select: taskDetailsSelect,
      });
    });
  }
}
