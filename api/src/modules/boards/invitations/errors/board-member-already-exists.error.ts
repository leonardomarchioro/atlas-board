import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";

export class BoardMemberAlreadyExistsError extends AppError {
  constructor(message = "Você já é membro deste board.") {
    super(message, ErrorCode.CONFLICT);
  }
}
