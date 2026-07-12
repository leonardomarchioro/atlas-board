import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";

export class EmailAlreadyInUseError extends AppError {
  constructor() {
    super("Este e-mail já está sendo utilizado.", ErrorCode.CONFLICT);
  }
}
