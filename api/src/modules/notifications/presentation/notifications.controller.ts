import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from "@nestjs/swagger";
import type { AuthenticatedUser } from "@shared/auth/authenticated-user.interface";
import { CurrentUser } from "@shared/auth/current-user.decorator";
import { JwtAuthGuard } from "@shared/auth/jwt-auth.guard";

import { GetUnreadCountUseCase } from "../application/get-unread-count.use-case";
import { ListNotificationsUseCase } from "../application/list-notifications.use-case";
import { MarkAllNotificationsAsReadUseCase } from "../application/mark-all-notifications-as-read.use-case";
import { MarkNotificationAsReadUseCase } from "../application/mark-notification-as-read.use-case";
import { ListNotificationsQueryDto } from "./dto/list-notifications-query.dto";
import { NotificationPresenter } from "./notification.presenter";

const notificationExample = {
  id: "b906bb26-a72c-449e-9d95-0cf2ed4f0886",
  type: "TASK_MOVED",
  title: "Tarefa movimentada",
  message:
    'Leonardo moveu a tarefa "Criar fluxo de login" de "A fazer" para "Em andamento".',
  data: {
    boardId: "board-id",
    taskId: "task-id",
    taskTitle: "Criar fluxo de login",
    fromColumnId: "column-id",
    fromColumnName: "A fazer",
    toColumnId: "other-column-id",
    toColumnName: "Em andamento",
    movedByUserId: "user-id",
  },
  readAt: null,
  createdAt: "2026-07-27T12:00:00.000Z",
};

@Controller("notifications")
@UseGuards(JwtAuthGuard)
@ApiTags("Notifications")
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: "Token ausente, inválido ou expirado.",
})
export class NotificationsController {
  constructor(
    private readonly listNotifications: ListNotificationsUseCase,
    private readonly unreadCount: GetUnreadCountUseCase,
    private readonly markAsRead: MarkNotificationAsReadUseCase,
    private readonly markAllAsRead: MarkAllNotificationsAsReadUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: "Lista as notificações do usuário autenticado" })
  @ApiQuery({ name: "page", required: false, example: 1 })
  @ApiQuery({ name: "limit", required: false, example: 20 })
  @ApiQuery({ name: "read", required: false, type: Boolean })
  @ApiOkResponse({
    schema: {
      example: {
        data: [notificationExample],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    },
  })
  @ApiUnprocessableEntityResponse({
    description: "Paginação ou filtro inválido.",
  })
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query(
      new ValidationPipe({
        expectedType: ListNotificationsQueryDto,
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    rawQuery: unknown,
  ) {
    const query = rawQuery as ListNotificationsQueryDto;
    const result = await this.listNotifications.execute({
      userId: user.id,
      page: query.page,
      limit: query.limit,
      read: query.read,
    });
    return {
      data: result.data.map(NotificationPresenter.toHTTP),
      pagination: result.pagination,
    };
  }

  @Get("unread-count")
  @ApiOperation({ summary: "Conta as notificações não lidas" })
  @ApiOkResponse({ schema: { example: { count: 3 } } })
  unread(@CurrentUser() user: AuthenticatedUser) {
    return this.unreadCount.execute({ userId: user.id });
  }

  @Patch("read-all")
  @ApiOperation({ summary: "Marca todas as notificações como lidas" })
  @ApiOkResponse({ schema: { example: { updatedCount: 3 } } })
  markAll(@CurrentUser() user: AuthenticatedUser) {
    return this.markAllAsRead.execute({ userId: user.id });
  }

  @Patch(":notificationId/read")
  @ApiOperation({ summary: "Marca uma notificação como lida" })
  @ApiOkResponse({
    schema: {
      example: { ...notificationExample, readAt: "2026-07-27T12:05:00.000Z" },
    },
  })
  @ApiNotFoundResponse({
    description: "Notificação inexistente ou pertencente a outro usuário.",
  })
  @ApiUnprocessableEntityResponse({ description: "ID inválido." })
  async markOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param(
      "notificationId",
      new ParseUUIDPipe({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    notificationId: string,
  ) {
    return NotificationPresenter.toHTTP(
      await this.markAsRead.execute({ notificationId, userId: user.id }),
    );
  }
}
