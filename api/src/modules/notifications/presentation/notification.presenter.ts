import type { Notification } from "@prisma/client";

export type NotificationResponse = {
  id: string;
  type: Notification["type"];
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
};

export class NotificationPresenter {
  static toHTTP(notification: Notification): NotificationResponse {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: NotificationPresenter.toData(notification.data),
      readAt: notification.readAt?.toISOString() ?? null,
      createdAt: notification.createdAt.toISOString(),
    };
  }

  private static toData(
    value: Notification["data"],
  ): Record<string, unknown> | null {
    if (!value || Array.isArray(value) || typeof value !== "object")
      return null;
    return value as Record<string, unknown>;
  }
}
