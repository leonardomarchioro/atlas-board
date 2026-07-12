import { Injectable } from "@nestjs/common";

import { UseCase } from "@shared/application/use-case.interface";
import {
  GetUserByIdInput,
  GetUserByIdUseCase,
} from "@modules/users/application/get-user-by-id.use-case";
import { PublicUser } from "@modules/users/application/select/user-public-fields";

@Injectable()
export class GetAuthenticatedUserUseCase implements UseCase<
  GetUserByIdInput,
  PublicUser
> {
  constructor(private readonly getUserByIdUseCase: GetUserByIdUseCase) {}

  execute(input: GetUserByIdInput): Promise<PublicUser> {
    return this.getUserByIdUseCase.execute(input);
  }
}
