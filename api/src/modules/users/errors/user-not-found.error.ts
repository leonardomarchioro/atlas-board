import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";

export class UserNotFoundError extends AppError {
  constructor() {
    super("Usuário não encontrado.", ErrorCode.RESOURCE_NOT_FOUND);
  }
}
