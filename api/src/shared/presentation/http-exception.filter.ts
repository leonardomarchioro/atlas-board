import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { AppError } from "@shared/errors/app-error";
import { ErrorCode } from "@shared/errors/error-codes";
import { Response } from "express";

@Catch(AppError)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: AppError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    const statusByCode: Record<string, number> = {
      [ErrorCode.RESOURCE_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [ErrorCode.ACCESS_DENIED]: HttpStatus.FORBIDDEN,
      [ErrorCode.UNAUTHORIZED]: HttpStatus.UNAUTHORIZED,
      [ErrorCode.CONFLICT]: HttpStatus.CONFLICT,
      [ErrorCode.VALIDATION_ERROR]: HttpStatus.BAD_REQUEST,
    };

    const status =
      statusByCode[exception.code] ?? HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      code: exception.code,
      message: exception.message,
    });
  }
}
