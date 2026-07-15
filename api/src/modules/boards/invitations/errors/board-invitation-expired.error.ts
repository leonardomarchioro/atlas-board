import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";

export class BoardInvitationExpiredError extends AppError {
  constructor() {
    super("Este convite expirou.", ErrorCode.GONE);
  }
}
