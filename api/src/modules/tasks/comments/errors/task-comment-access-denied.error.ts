import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";

export class TaskCommentAccessDeniedError extends AppError {
  constructor() {
    super(
      "Você não possui permissão para alterar este comentário.",
      ErrorCode.ACCESS_DENIED,
    );
  }
}
