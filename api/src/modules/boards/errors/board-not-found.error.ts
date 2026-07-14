import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";

export class BoardNotFoundError extends AppError {
  constructor() {
    super("Board não encontrado.", ErrorCode.RESOURCE_NOT_FOUND);
  }
}
