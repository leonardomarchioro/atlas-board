import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";
export class InvalidTaskPositionError extends AppError {
  constructor() {
    super("Posição de tarefa inválida.", ErrorCode.VALIDATION_ERROR);
  }
}
