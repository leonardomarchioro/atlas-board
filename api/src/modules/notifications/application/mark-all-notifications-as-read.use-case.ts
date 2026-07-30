import { Injectable } from "@nestjs/common";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";

@Injectable()
export class MarkAllNotificationsAsReadUseCase implements UseCase<
  { userId: string },
  { updatedCount: number }
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({
    userId,
  }: {
    userId: string;
  }): Promise<{ updatedCount: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { updatedCount: result.count };
  }
}
