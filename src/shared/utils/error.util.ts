import i18next from "i18next";
import { HTTP_STATUS } from "../constants";
import { In_APP_Error } from "../../interfaces/app.interface";
import { In_API_ErrorFormat } from "../../interfaces/responseApi.interface";

export class AppError extends Error implements In_APP_Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors?: In_API_ErrorFormat[];

  constructor(
    message: string,
    statusCode: number,
    errors?: In_API_ErrorFormat[],
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

/** 404 standar: "Data {label} tidak ditemukan". */
export const notFoundError = (label: string): AppError =>
  new AppError(
    i18next.t("error.default.not_found", { m: label }),
    HTTP_STATUS.NOT_FOUND,
  );

/** 409 standar: "{label} sudah digunakan". */
export const existsError = (label: string): AppError =>
  new AppError(
    i18next.t("error.default.exists", { m: label }),
    HTTP_STATUS.CONFLICT,
  );
