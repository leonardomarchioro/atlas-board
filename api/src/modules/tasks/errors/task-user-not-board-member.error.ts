import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";
export class TaskUserNotBoardMemberError extends AppError {
  constructor() {
    super(
      "Um ou mais usuários não são membros ativos do board.",
      ErrorCode.VALIDATION_ERROR,
    );
  }
}
