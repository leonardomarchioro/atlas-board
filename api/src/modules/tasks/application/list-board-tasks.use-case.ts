import { Injectable } from "@nestjs/common";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import {
  TaskSummary,
  taskSummarySelect,
} from "../presentation/selects/task-summary.select";
import { TaskAccessService } from "../services/task-access.service";
export type ListBoardTasksInput = { boardId: string; currentUserId: string };
@Injectable()
export class ListBoardTasksUseCase implements UseCase<
  ListBoardTasksInput,
  TaskSummary[]
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: TaskAccessService,
  ) {}
  async execute({
    boardId,
    currentUserId,
  }: ListBoardTasksInput): Promise<TaskSummary[]> {
    await this.access.requireBoardAccess(boardId, currentUserId);
    return this.prisma.task.findMany({
      where: { boardId },
      select: taskSummarySelect,
      orderBy: [{ column: { position: "asc" } }, { position: "asc" }],
    });
  }
}
