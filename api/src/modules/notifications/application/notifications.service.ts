import { Injectable, Logger } from "@nestjs/common";
import type { Notification, NotificationType, Prisma } from "@prisma/client";
import { PrismaService } from "@shared/database/prisma.service";

import { NotificationPresenter } from "../presentation/notification.presenter";
import { NotificationsGateway } from "../presentation/notifications.gateway";

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Prisma.InputJsonValue;
}

export interface NotifyUsersInput {
  recipientUserIds: Array<string | null | undefined>;
  actorUserId?: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Prisma.InputJsonValue;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationsGateway,
  ) {}

  async create(input: CreateNotificationInput): Promise<Notification | null> {
    const [notification] = await this.notifyUsers({
      ...input,
      recipientUserIds: [input.userId],
    });
    return notification ?? null;
  }

  async notifyUsers(input: NotifyUsersInput): Promise<Notification[]> {
    const uniqueIds = [
      ...new Set(
        input.recipientUserIds.filter(
          (userId): userId is string =>
            typeof userId === "string" &&
            userId.length > 0 &&
            userId !== input.actorUserId,
        ),
      ),
    ];
    if (uniqueIds.length === 0) return [];

    const existingUsers = await this.prisma.user.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true },
    });
    const existingIds = new Set(existingUsers.map(({ id }) => id));
    const recipientIds = uniqueIds.filter((id) => existingIds.has(id));
    if (recipientIds.length === 0) return [];

    const notifications = await this.prisma.$transaction(
      recipientIds.map((userId) =>
        this.prisma.notification.create({
          data: {
            userId,
            type: input.type,
            title: input.title,
            message: input.message,
            data: input.data,
          },
        }),
      ),
    );

    for (const notification of notifications) {
      try {
        this.gateway.emitToUser(
          notification.userId,
          NotificationPresenter.toHTTP(notification),
        );
      } catch {
        this.logger.error(
          `Falha ao emitir notificação persistida ${notification.id}.`,
        );
      }
    }
    return notifications;
  }
}
