import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";

export class CannotRemoveBoardOwnerError extends AppError {
  constructor() {
    super("O criador do board não pode ser removido.", ErrorCode.CONFLICT);
  }
}
