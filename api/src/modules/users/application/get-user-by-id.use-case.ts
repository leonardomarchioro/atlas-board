import { Injectable } from "@nestjs/common";

import { UseCase } from "@shared/application/use-case.interface";
import { PrismaService } from "@shared/database/prisma.service";

import { UserNotFoundError } from "../errors/user-not-found.error";
import {
  PublicUser,
  userPublicFields,
} from "./select/user-public-fields";

export type GetUserByIdInput = {
  userId: string;
};

@Injectable()
export class GetUserByIdUseCase implements UseCase<
  GetUserByIdInput,
  PublicUser
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ userId }: GetUserByIdInput): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: userPublicFields,
    });

    if (!user) {
      throw new UserNotFoundError();
    }

    return user;
  }
}
