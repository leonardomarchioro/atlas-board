import { Injectable } from "@nestjs/common";
import type { Notification } from "@prisma/client";
import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";

import { NotificationNotFoundError } from "../errors/notification-not-found.error";

export type MarkNotificationAsReadInput = {
  notificationId: string;
  userId: string;
};

@Injectable()
export class MarkNotificationAsReadUseCase implements UseCase<
  MarkNotificationAsReadInput,
  Notification
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: MarkNotificationAsReadInput): Promise<Notification> {
    const notification = await this.prisma.notification.findFirst({
      where: { id: input.notificationId, userId: input.userId },
    });
    if (!notification) throw new NotificationNotFoundError();
    if (notification.readAt) return notification;

    await this.prisma.notification.updateMany({
      where: { id: notification.id, userId: input.userId, readAt: null },
      data: { readAt: new Date() },
    });
    return this.prisma.notification.findUniqueOrThrow({
      where: { id: notification.id },
    });
  }
}
