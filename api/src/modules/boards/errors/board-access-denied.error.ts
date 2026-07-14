import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";

export class BoardAccessDeniedError extends AppError {
  constructor() {
    super(
      "Você não possui permissão para realizar esta ação neste board.",
      ErrorCode.ACCESS_DENIED,
    );
  }
}
