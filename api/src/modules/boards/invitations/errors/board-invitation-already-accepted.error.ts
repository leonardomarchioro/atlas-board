import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";

export class BoardInvitationAlreadyAcceptedError extends AppError {
  constructor() {
    super("Este convite já foi aceito.", ErrorCode.CONFLICT);
  }
}
