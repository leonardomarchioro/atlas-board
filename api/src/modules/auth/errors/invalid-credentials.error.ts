import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";

export class InvalidCredentialsError extends AppError {
  constructor() {
    super("E-mail ou senha inválidos.", ErrorCode.UNAUTHORIZED);
  }
}
