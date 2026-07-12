import { randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import { userPublicFields } from "@modules/users/application/select/user-public-fields";

import { InvalidRefreshTokenError } from "../errors/invalid-refresh-token.error";
import { RefreshTokenExpiredError } from "../errors/refresh-token-expired.error";
import { HashService } from "../infrastructure/hashing/hash.service";
import { getExpirationDate } from "../infrastructure/tokens/token-expiration";
import { TokenService } from "../infrastructure/tokens/token.service";
import { AuthUseCaseOutput } from "./register-user.use-case";

export type RefreshSessionInput = {
  refreshToken: string;
};

@Injectable()
export class RefreshSessionUseCase implements UseCase<
  RefreshSessionInput,
  AuthUseCaseOutput
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}

  async execute({
    refreshToken,
  }: RefreshSessionInput): Promise<AuthUseCaseOutput> {
    const payload = await this.verifyToken(refreshToken);

    if (payload.type !== "refresh") {
      throw new InvalidRefreshTokenError();
    }

    const storedRefreshToken = await this.prisma.refreshToken.findUnique({
      where: { jti: payload.jti },
      select: {
        id: true,
        userId: true,
        tokenHash: true,
        expiresAt: true,
        revokedAt: true,
      },
    });

    if (!storedRefreshToken || storedRefreshToken.userId !== payload.sub) {
      throw new InvalidRefreshTokenError();
    }

    const tokenMatches = await this.hashService.compare(
      refreshToken,
      storedRefreshToken.tokenHash,
    );

    if (!tokenMatches || storedRefreshToken.revokedAt) {
      throw new InvalidRefreshTokenError();
    }

    if (storedRefreshToken.expiresAt <= new Date()) {
      throw new RefreshTokenExpiredError();
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: userPublicFields,
    });

    if (!user) {
      throw new InvalidRefreshTokenError();
    }

    const accessToken = await this.tokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
    });

    const nextRefreshJti = randomUUID();
    const nextRefreshToken = await this.tokenService.generateRefreshToken({
      sub: user.id,
      jti: nextRefreshJti,
      type: "refresh",
    });
    const nextRefreshTokenHash = await this.hashService.hash(nextRefreshToken);
    const nextRefreshExpiresAt = getExpirationDate(
      this.configService.getOrThrow<string>("JWT_REFRESH_EXPIRES_IN"),
    );

    await this.prisma.$transaction([
      this.prisma.refreshToken.update({
        where: { id: storedRefreshToken.id },
        data: { revokedAt: new Date() },
      }),
      this.prisma.refreshToken.create({
        data: {
          userId: user.id,
          jti: nextRefreshJti,
          tokenHash: nextRefreshTokenHash,
          expiresAt: nextRefreshExpiresAt,
        },
      }),
    ]);

    return {
      accessToken,
      refreshToken: nextRefreshToken,
      user,
    };
  }

  private async verifyToken(refreshToken: string) {
    try {
      return await this.tokenService.verifyRefreshToken(refreshToken);
    } catch {
      throw new InvalidRefreshTokenError();
    }
  }
}
