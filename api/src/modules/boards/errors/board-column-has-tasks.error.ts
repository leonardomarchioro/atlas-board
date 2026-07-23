import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";

export class BoardColumnHasTasksError extends AppError {
  constructor() {
    super(
      "Não é possível excluir uma coluna que possui tarefas.",
      ErrorCode.CONFLICT,
    );
  }
}
