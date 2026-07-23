import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";

export class TagAlreadyExistsError extends AppError {
  constructor() {
    super("Já existe uma tag com este nome no board.", ErrorCode.CONFLICT);
  }
}
