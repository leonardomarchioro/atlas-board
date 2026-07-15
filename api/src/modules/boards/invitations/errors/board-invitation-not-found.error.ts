import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";

export class BoardInvitationNotFoundError extends AppError {
  constructor() {
    super("Convite não encontrado.", ErrorCode.RESOURCE_NOT_FOUND);
  }
}
