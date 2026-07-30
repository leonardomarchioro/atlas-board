import { api } from "@/lib/axios";
import type {
  AtlasNotification,
  MarkAllReadResult,
  NotificationsPage,
  UnreadCount,
} from "@/features/notifications/notification.types";

export async function listNotifications(page: number, limit = 20): Promise<NotificationsPage> {
  return (await api.get<NotificationsPage>("/notifications", { params: { page, limit } })).data;
}

export async function getUnreadNotificationsCount(): Promise<UnreadCount> {
  return (await api.get<UnreadCount>("/notifications/unread-count")).data;
}

export async function markNotificationAsRead(id: string): Promise<AtlasNotification> {
  return (await api.patch<AtlasNotification>(`/notifications/${id}/read`)).data;
}

export async function markAllNotificationsAsRead(): Promise<MarkAllReadResult> {
  return (await api.patch<MarkAllReadResult>("/notifications/read-all")).data;
}
