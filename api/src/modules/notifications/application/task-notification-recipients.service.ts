import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/database/prisma.service";

@Injectable()
export class TaskNotificationRecipientsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRecipientUserIds(taskId: string): Promise<string[]> {
    const task = await this.prisma.task.findUniqueOrThrow({
      where: { id: taskId },
      select: {
        createdById: true,
        assigneeId: true,
        sharedWith: { select: { userId: true } },
      },
    });
    return [
      task.createdById,
      ...(task.assigneeId ? [task.assigneeId] : []),
      ...task.sharedWith.map(({ userId }) => userId),
    ];
  }
}
