import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";
export class TaskAccessDeniedError extends AppError {
  constructor() {
    super("Você não possui acesso a esta tarefa.", ErrorCode.ACCESS_DENIED);
  }
}
