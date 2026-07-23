import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";

export class CannotInviteSelfError extends AppError {
  constructor() {
    super("Você já é administrador deste board.", ErrorCode.CONFLICT);
  }
}
