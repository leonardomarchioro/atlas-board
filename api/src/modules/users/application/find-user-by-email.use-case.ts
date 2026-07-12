import { Injectable } from "@nestjs/common";

import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";

import {
  PublicUser,
  userPublicFields,
} from "./select/user-public-fields";

export type FindUserByEmailInput = {
  email: string;
};

@Injectable()
export class FindUserByEmailUseCase implements UseCase<
  FindUserByEmailInput,
  PublicUser | null
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ email }: FindUserByEmailInput): Promise<PublicUser | null> {
    const normalizedEmail = email.trim().toLowerCase();

    return this.prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
      select: userPublicFields,
    });
  }
}
