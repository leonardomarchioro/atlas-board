import { Module } from "@nestjs/common";

import { FindUserByEmailUseCase } from "./application/find-user-by-email.use-case";
import { GetUserByIdUseCase } from "./application/get-user-by-id.use-case";
import { UpdateUserUseCase } from "./application/update-user.use-case";
import { UsersController } from "./presentation/user.controller";

@Module({
  controllers: [UsersController],
  providers: [GetUserByIdUseCase, FindUserByEmailUseCase, UpdateUserUseCase],
  exports: [FindUserByEmailUseCase, GetUserByIdUseCase],
})
export class UsersModule {}
