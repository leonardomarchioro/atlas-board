import type { AtlasNotification } from "@/features/notifications/notification.types";

function stringData(data: Record<string, unknown> | null, key: string): string | null {
  const value = data?.[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function getNotificationHref(notification: AtlasNotification): string | null {
  if (notification.type === "BOARD_INVITATION_RECEIVED") {
    const invitationId = stringData(notification.data, "invitationId");
    if (invitationId) {
      return `/convites/interno/${encodeURIComponent(invitationId)}`;
    }
  }

  if (
    notification.type === "TASK_ASSIGNED" ||
    notification.type === "TASK_MOVED" ||
    notification.type === "TASK_COMMENT_CREATED"
  ) {
    const boardId = stringData(notification.data, "boardId");
    const taskId = stringData(notification.data, "taskId");
    if (boardId && taskId) {
      return `/boards/${encodeURIComponent(boardId)}?task=${encodeURIComponent(taskId)}`;
    }
  }
  return null;
}
