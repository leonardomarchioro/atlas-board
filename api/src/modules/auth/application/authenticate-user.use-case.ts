import { randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";

import { InvalidCredentialsError } from "../errors/invalid-credentials.error";
import { HashService } from "../infrastructure/hashing/hash.service";
import { getExpirationDate } from "../infrastructure/tokens/token-expiration";
import { TokenService } from "../infrastructure/tokens/token.service";
import { AuthUseCaseOutput } from "./register-user.use-case";
import { userAuthFields } from "./select/user-auth-fields";

export type AuthenticateUserInput = {
  email: string;
  password: string;
};

@Injectable()
export class AuthenticateUserUseCase implements UseCase<
  AuthenticateUserInput,
  AuthUseCaseOutput
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}

  async execute(input: AuthenticateUserInput): Promise<AuthUseCaseOutput> {
    const email = input.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: userAuthFields,
    });

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await this.hashService.compare(
      input.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    const accessToken = await this.tokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
    });

    const refreshJti = randomUUID();
    const refreshToken = await this.tokenService.generateRefreshToken({
      sub: user.id,
      jti: refreshJti,
      type: "refresh",
    });
    const refreshTokenHash = await this.hashService.hash(refreshToken);
    const refreshExpiresAt = getExpirationDate(
      this.configService.getOrThrow<string>("JWT_REFRESH_EXPIRES_IN"),
    );

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        jti: refreshJti,
        tokenHash: refreshTokenHash,
        expiresAt: refreshExpiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }
}
