import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";

export class BoardInvitationAlreadyExistsError extends AppError {
  constructor() {
    super(
      "Já existe um convite pendente válido para este e-mail.",
      ErrorCode.CONFLICT,
    );
  }
}
