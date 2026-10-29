import { In_APP_Error } from '../../interfaces/app.interface';
import { In_API_ErrorFormat } from '../../interfaces/responseApi.interface';

export class AppError extends Error implements In_APP_Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors?: In_ErrorDetail[];

  constructor(message: string, statusCode: number, errors?: In_API_ErrorFormat[]) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}
