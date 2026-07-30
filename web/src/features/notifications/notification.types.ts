export const knownNotificationTypes = [
  "BOARD_INVITATION_RECEIVED",
  "TASK_ASSIGNED",
  "TASK_MOVED",
  "TASK_COMMENT_CREATED",
] as const;

export type NotificationType = (typeof knownNotificationTypes)[number];

type NotificationBase<TType extends string, TData> = {
  id: string;
  type: TType;
  title: string;
  message: string;
  data: TData;
  readAt: string | null;
  createdAt: string;
};

export type BoardInvitationNotification = NotificationBase<
  "BOARD_INVITATION_RECEIVED",
  { boardId: string; boardName: string; invitationId: string }
>;
export type TaskAssignedNotification = NotificationBase<
  "TASK_ASSIGNED",
  { boardId: string; taskId: string; taskTitle: string; assignedByUserId: string }
>;
export type TaskMovedNotification = NotificationBase<
  "TASK_MOVED",
  {
    boardId: string;
    taskId: string;
    taskTitle: string;
    fromColumnId: string;
    fromColumnName: string;
    toColumnId: string;
    toColumnName: string;
    movedByUserId: string;
  }
>;
export type TaskCommentCreatedNotification = NotificationBase<
  "TASK_COMMENT_CREATED",
  {
    boardId: string;
    taskId: string;
    taskTitle: string;
    commentId: string;
    authorId: string;
  }
>;

export type KnownNotification =
  | BoardInvitationNotification
  | TaskAssignedNotification
  | TaskMovedNotification
  | TaskCommentCreatedNotification;

export type AtlasNotification = NotificationBase<string, Record<string, unknown> | null>;

export type NotificationsPage = {
  data: AtlasNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type UnreadCount = { count: number };
export type MarkAllReadResult = { updatedCount: number };
