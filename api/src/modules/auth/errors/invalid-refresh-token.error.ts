import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";

export class InvalidRefreshTokenError extends AppError {
  constructor() {
    super("Refresh token inválido.", ErrorCode.UNAUTHORIZED);
  }
}
