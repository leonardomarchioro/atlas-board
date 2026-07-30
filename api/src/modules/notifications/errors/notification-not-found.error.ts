import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";

export class NotificationNotFoundError extends AppError {
  constructor() {
    super("Notificação não encontrada.", ErrorCode.RESOURCE_NOT_FOUND);
  }
}
