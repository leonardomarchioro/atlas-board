import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";
export class TaskChecklistItemNotFoundError extends AppError {
  constructor() {
    super(
      "Item de checklist não encontrado nesta tarefa.",
      ErrorCode.RESOURCE_NOT_FOUND,
    );
  }
}
