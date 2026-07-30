import { Injectable } from "@nestjs/common";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";

@Injectable()
export class GetUnreadCountUseCase implements UseCase<
  { userId: string },
  { count: number }
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ userId }: { userId: string }): Promise<{ count: number }> {
    return {
      count: await this.prisma.notification.count({
        where: { userId, readAt: null },
      }),
    };
  }
}
