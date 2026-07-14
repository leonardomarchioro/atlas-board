import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AuthModule } from "@modules/auth/auth.module";
import { BoardsModule } from "@modules/boards/boards.module";
import { UsersModule } from "@modules/users/users.module";
import { TasksModule } from "@modules/tasks/tasks.module";
import { PrismaModule } from "@shared/database/prisma.module";

const requiredEnvironmentVariables = [
  "JWT_ACCESS_SECRET",
  "JWT_ACCESS_EXPIRES_IN",
  "JWT_REFRESH_SECRET",
  "JWT_REFRESH_EXPIRES_IN",
] as const;

function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  for (const key of requiredEnvironmentVariables) {
    if (typeof config[key] !== "string" || config[key].trim() === "") {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  return config;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    BoardsModule,
    TasksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
