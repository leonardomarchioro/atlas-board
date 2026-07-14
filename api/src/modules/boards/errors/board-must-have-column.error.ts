import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";

export class BoardMustHaveColumnError extends AppError {
  constructor() {
    super("O board deve possuir pelo menos uma coluna.", ErrorCode.CONFLICT);
  }
}
