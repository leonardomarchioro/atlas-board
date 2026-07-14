import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";

export class BoardMemberNotFoundError extends AppError {
  constructor() {
    super("Membro não encontrado neste board.", ErrorCode.RESOURCE_NOT_FOUND);
  }
}
