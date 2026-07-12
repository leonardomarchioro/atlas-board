import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
} from "@nestjs/common";

import { CurrentUser } from "@shared/auth/current-user.decorator";
import type { AuthenticatedUser } from "@shared/auth/authenticated-user.interface";
import { JwtAuthGuard } from "@shared/auth/jwt-auth.guard";

import { GetUserByIdUseCase } from "../application/get-user-by-id.use-case";
import { UpdateUserUseCase } from "../application/update-user.use-case";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserPresenter, UserResponse } from "./presenters/user.presenter";

@Controller("users")
export class UsersController {
  constructor(
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
  ) {}

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: AuthenticatedUser): Promise<UserResponse> {
    const authenticatedUser = await this.getUserByIdUseCase.execute({
      userId: user.id,
    });

    return UserPresenter.toHTTP(authenticatedUser);
  }

  @Patch("me")
  @UseGuards(JwtAuthGuard)
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateUserDto,
  ): Promise<UserResponse> {
    const updatedUser = await this.updateUserUseCase.execute({
      userId: user.id,
      name: body.name,
      avatarUrl: body.avatarUrl,
    });

    return UserPresenter.toHTTP(updatedUser);
  }
}
