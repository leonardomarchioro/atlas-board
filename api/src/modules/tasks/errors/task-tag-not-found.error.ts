import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";
export class TaskTagNotFoundError extends AppError {
  constructor() {
    super(
      "Uma ou mais tags não pertencem ao board.",
      ErrorCode.RESOURCE_NOT_FOUND,
    );
  }
}
