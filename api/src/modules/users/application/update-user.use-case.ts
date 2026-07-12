import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";

import { UserNotFoundError } from "../errors/user-not-found.error";
import {
  PublicUser,
  userPublicFields,
} from "./select/user-public-fields";

export type UpdateUserInput = {
  userId: string;
  name?: string;
  avatarUrl?: string | null;
};

@Injectable()
export class UpdateUserUseCase implements UseCase<UpdateUserInput, PublicUser> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({
    userId,
    name,
    avatarUrl,
  }: UpdateUserInput): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new UserNotFoundError();
    }

    const data: Prisma.UserUpdateInput = {};

    if (name !== undefined) {
      data.name = name.trim();
    }

    if (avatarUrl !== undefined) {
      data.avatarUrl = avatarUrl;
    }

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data,
      select: userPublicFields,
    });
  }
}
