import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";

export class InvalidBoardColumnOrderError extends AppError {
  constructor() {
    super(
      "A ordem informada para as colunas é inválida.",
      ErrorCode.VALIDATION_ERROR,
    );
  }
}
