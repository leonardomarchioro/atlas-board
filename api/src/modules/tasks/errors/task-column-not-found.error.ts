import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";
export class TaskColumnNotFoundError extends AppError {
  constructor() {
    super("Coluna não encontrada neste board.", ErrorCode.RESOURCE_NOT_FOUND);
  }
}
