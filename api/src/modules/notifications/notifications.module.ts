import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { GetUnreadCountUseCase } from "./application/get-unread-count.use-case";
import { ListNotificationsUseCase } from "./application/list-notifications.use-case";
import { MarkAllNotificationsAsReadUseCase } from "./application/mark-all-notifications-as-read.use-case";
import { MarkNotificationAsReadUseCase } from "./application/mark-notification-as-read.use-case";
import { NotificationMessagesService } from "./application/notification-messages.service";
import { NotificationsService } from "./application/notifications.service";
import { TaskNotificationRecipientsService } from "./application/task-notification-recipients.service";
import { DomainNotificationsService } from "./application/domain-notifications.service";
import { NotificationsController } from "./presentation/notifications.controller";
import { NotificationsGateway } from "./presentation/notifications.gateway";

@Module({
  imports: [JwtModule.register({})],
  controllers: [NotificationsController],
  providers: [
    NotificationsGateway,
    NotificationsService,
    NotificationMessagesService,
    TaskNotificationRecipientsService,
    DomainNotificationsService,
    ListNotificationsUseCase,
    GetUnreadCountUseCase,
    MarkNotificationAsReadUseCase,
    MarkAllNotificationsAsReadUseCase,
  ],
  exports: [
    NotificationsService,
    NotificationMessagesService,
    TaskNotificationRecipientsService,
    DomainNotificationsService,
  ],
})
export class NotificationsModule {}
