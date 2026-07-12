import { Injectable } from "@nestjs/common";

import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";

import { TokenService } from "../infrastructure/tokens/token.service";

export type LogoutUserInput = {
  refreshToken: string;
};

@Injectable()
export class LogoutUserUseCase implements UseCase<LogoutUserInput, void> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async execute({ refreshToken }: LogoutUserInput): Promise<void> {
    try {
      const payload = await this.tokenService.verifyRefreshToken(refreshToken);

      if (payload.type !== "refresh") {
        return;
      }

      await this.prisma.refreshToken.updateMany({
        where: {
          jti: payload.jti,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    } catch {
      return;
    }
  }
}
