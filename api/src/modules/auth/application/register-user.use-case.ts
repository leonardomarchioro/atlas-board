import { randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";
import {
  PublicUser,
  userPublicFields,
} from "@modules/users/application/select/user-public-fields";

import { EmailAlreadyInUseError } from "../errors/email-already-in-use.error";
import { HashService } from "../infrastructure/hashing/hash.service";
import { getExpirationDate } from "../infrastructure/tokens/token-expiration";
import { TokenService } from "../infrastructure/tokens/token.service";

export type RegisterUserInput = {
  name: string;
  email: string;
  password: string;
};

export type AuthUseCaseOutput = {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
};

@Injectable()
export class RegisterUserUseCase implements UseCase<
  RegisterUserInput,
  AuthUseCaseOutput
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}

  async execute(input: RegisterUserInput): Promise<AuthUseCaseOutput> {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();

    const userAlreadyExists = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (userAlreadyExists) {
      throw new EmailAlreadyInUseError();
    }

    const passwordHash = await this.hashService.hash(input.password);
    const refreshExpiresAt = getExpirationDate(
      this.configService.getOrThrow<string>("JWT_REFRESH_EXPIRES_IN"),
    );

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
        select: userPublicFields,
      });

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

      await tx.refreshToken.create({
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
        user,
      };
    });
  }
}
