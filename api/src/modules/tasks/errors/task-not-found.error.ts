import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";
export class TaskNotFoundError extends AppError {
  constructor() {
    super("Tarefa não encontrada.", ErrorCode.RESOURCE_NOT_FOUND);
  }
}
