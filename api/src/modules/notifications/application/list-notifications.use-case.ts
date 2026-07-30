import { Injectable } from "@nestjs/common";
import type { Notification, Prisma } from "@prisma/client";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";

export type ListNotificationsInput = {
  userId: string;
  page: number;
  limit: number;
  read?: boolean;
};

export type ListNotificationsOutput = {
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

@Injectable()
export class ListNotificationsUseCase implements UseCase<
  ListNotificationsInput,
  ListNotificationsOutput
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    input: ListNotificationsInput,
  ): Promise<ListNotificationsOutput> {
    const where: Prisma.NotificationWhereInput = {
      userId: input.userId,
      ...(input.read === undefined
        ? {}
        : { readAt: input.read ? { not: null } : null }),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      this.prisma.notification.count({ where }),
    ]);
    const totalPages = Math.ceil(total / input.limit);
    return {
      data,
      pagination: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages,
        hasNextPage: input.page < totalPages,
        hasPreviousPage: input.page > 1,
      },
    };
  }
}
