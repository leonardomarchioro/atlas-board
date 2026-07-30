import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { PrismaService } from "@shared/database/prisma.service";
import type { Server, Socket } from "socket.io";

import type { NotificationResponse } from "./notification.presenter";

type AccessTokenPayload = {
  sub: string;
  email: string;
};

type AuthenticatedSocket = Socket & {
  data: {
    userId?: string;
  };
};

@WebSocketGateway({
  namespace: "/notifications",
  cors: {
    credentials: true,
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      const allowedOrigins = (
        process.env.CORS_ORIGINS ?? "http://localhost:3001"
      )
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      callback(
        origin && !allowedOrigins.includes(origin)
          ? new Error("Origem não permitida.")
          : null,
        true,
      );
    },
  },
})
export class NotificationsGateway implements OnGatewayInit {
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  private server!: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  afterInit(server: Server): void {
    server.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (typeof token !== "string" || token.trim() === "") {
          return next(new Error("Autenticação do socket inválida."));
        }
        const payload = await this.jwt.verifyAsync<AccessTokenPayload>(token, {
          secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
        });
        const user = await this.prisma.user.findUnique({
          where: { id: payload.sub },
          select: { id: true, email: true },
        });
        if (!user || user.email !== payload.email) {
          return next(new Error("Autenticação do socket inválida."));
        }
        socket.data.userId = user.id;
        await socket.join(`user:${user.id}`);
        next();
      } catch {
        this.logger.warn(
          "Conexão de socket recusada por autenticação inválida.",
        );
        next(new Error("Autenticação do socket inválida."));
      }
    });
  }

  emitToUser(userId: string, notification: NotificationResponse): void {
    this.server.to(`user:${userId}`).emit("notification:new", notification);
  }
}
