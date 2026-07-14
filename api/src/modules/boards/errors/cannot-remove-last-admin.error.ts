import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";

export class CannotRemoveLastAdminError extends AppError {
  constructor() {
    super(
      "O último administrador do board não pode ser removido.",
      ErrorCode.CONFLICT,
    );
  }
}
