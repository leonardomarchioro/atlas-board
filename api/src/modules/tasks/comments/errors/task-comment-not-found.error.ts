import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";

export class TaskCommentNotFoundError extends AppError {
  constructor() {
    super(
      "Comentário não encontrado nesta tarefa.",
      ErrorCode.RESOURCE_NOT_FOUND,
    );
  }
}
