import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/database/prisma.service";

import { NotificationMessagesService } from "./notification-messages.service";
import { NotificationsService } from "./notifications.service";
import { TaskNotificationRecipientsService } from "./task-notification-recipients.service";

type BoardInvitationInput = {
  recipientUserId: string;
  actorUserId: string;
  boardId: string;
  boardName: string;
  invitationId: string;
};

type TaskAssignedInput = {
  recipientUserIds: string[];
  actorUserId: string;
  boardId: string;
  taskId: string;
  taskTitle: string;
};

type TaskMovedInput = {
  actorUserId: string;
  taskId: string;
  fromColumnId: string;
  toColumnId: string;
};

type TaskCommentCreatedInput = {
  actorUserId: string;
  taskId: string;
  commentId: string;
};

@Injectable()
export class DomainNotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly recipients: TaskNotificationRecipientsService,
    private readonly messages: NotificationMessagesService,
  ) {}

  async boardInvitation(input: BoardInvitationInput): Promise<void> {
    const actor = await this.actorName(input.actorUserId);
    await this.notifications.notifyUsers({
      recipientUserIds: [input.recipientUserId],
      actorUserId: input.actorUserId,
      type: "BOARD_INVITATION_RECEIVED",
      ...this.messages.boardInvitation(actor, input.boardName),
      data: {
        boardId: input.boardId,
        boardName: input.boardName,
        invitationId: input.invitationId,
      },
    });
  }

  async taskAssigned(input: TaskAssignedInput): Promise<void> {
    const actor = await this.actorName(input.actorUserId);
    await this.notifications.notifyUsers({
      recipientUserIds: input.recipientUserIds,
      actorUserId: input.actorUserId,
      type: "TASK_ASSIGNED",
      ...this.messages.taskAssigned(actor, input.taskTitle),
      data: {
        boardId: input.boardId,
        taskId: input.taskId,
        taskTitle: input.taskTitle,
        assignedByUserId: input.actorUserId,
      },
    });
  }

  async taskMoved(input: TaskMovedInput): Promise<void> {
    const [task, fromColumn, toColumn, actor] = await Promise.all([
      this.prisma.task.findUniqueOrThrow({
        where: { id: input.taskId },
        select: { id: true, boardId: true, title: true },
      }),
      this.prisma.boardColumn.findUniqueOrThrow({
        where: { id: input.fromColumnId },
        select: { name: true },
      }),
      this.prisma.boardColumn.findUniqueOrThrow({
        where: { id: input.toColumnId },
        select: { name: true },
      }),
      this.actorName(input.actorUserId),
    ]);
    await this.notifications.notifyUsers({
      recipientUserIds: await this.recipients.getRecipientUserIds(task.id),
      actorUserId: input.actorUserId,
      type: "TASK_MOVED",
      ...this.messages.taskMoved(
        actor,
        task.title,
        fromColumn.name,
        toColumn.name,
        input.fromColumnId === input.toColumnId,
      ),
      data: {
        boardId: task.boardId,
        taskId: task.id,
        taskTitle: task.title,
        fromColumnId: input.fromColumnId,
        fromColumnName: fromColumn.name,
        toColumnId: input.toColumnId,
        toColumnName: toColumn.name,
        movedByUserId: input.actorUserId,
      },
    });
  }

  async taskCommentCreated(input: TaskCommentCreatedInput): Promise<void> {
    const [task, actor] = await Promise.all([
      this.prisma.task.findUniqueOrThrow({
        where: { id: input.taskId },
        select: { id: true, boardId: true, title: true },
      }),
      this.actorName(input.actorUserId),
    ]);
    await this.notifications.notifyUsers({
      recipientUserIds: await this.recipients.getRecipientUserIds(task.id),
      actorUserId: input.actorUserId,
      type: "TASK_COMMENT_CREATED",
      ...this.messages.taskCommented(actor, task.title),
      data: {
        boardId: task.boardId,
        taskId: task.id,
        taskTitle: task.title,
        commentId: input.commentId,
        authorId: input.actorUserId,
      },
    });
  }

  private async actorName(userId: string): Promise<string> {
    const actor = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    return actor?.name ?? "Alguém";
  }
}
