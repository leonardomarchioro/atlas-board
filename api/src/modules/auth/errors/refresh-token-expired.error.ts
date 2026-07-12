import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";

export class RefreshTokenExpiredError extends AppError {
  constructor() {
    super("Refresh token expirado.", ErrorCode.UNAUTHORIZED);
  }
}
