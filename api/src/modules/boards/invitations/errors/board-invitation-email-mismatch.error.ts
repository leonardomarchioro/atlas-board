import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";

export class BoardInvitationEmailMismatchError extends AppError {
  constructor() {
    super(
      "Este convite foi enviado para outro endereço de e-mail.",
      ErrorCode.ACCESS_DENIED,
    );
  }
}
