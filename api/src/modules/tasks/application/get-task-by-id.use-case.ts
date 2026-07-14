import { Injectable } from "@nestjs/common";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import {
  TaskDetails,
  taskDetailsSelect,
} from "../presentation/selects/task-details.select";
import { TaskAccessService } from "../services/task-access.service";
export type GetTaskByIdInput = { taskId: string; currentUserId: string };
@Injectable()
export class GetTaskByIdUseCase implements UseCase<
  GetTaskByIdInput,
  TaskDetails
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: TaskAccessService,
  ) {}
  async execute({
    taskId,
    currentUserId,
  }: GetTaskByIdInput): Promise<TaskDetails> {
    await this.access.requireTaskAccess(taskId, currentUserId);
    return this.prisma.task.findUniqueOrThrow({
      where: { id: taskId },
      select: taskDetailsSelect,
    });
  }
}
