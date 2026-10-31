import { Response } from "express";
import {
  In_RESPONSE_Success,
  In_RESPONSE_Pagination,
  In_RESPONSE_Error,
  In_API_ErrorFormat,
  In_API_AttributMeta,
} from "../../interfaces/responseApi.interface";

export class ResponseAPI {
  // Success
  public static success(
    res: Response,
    statusCode: number,
    message: string,
    data?: object | Record<string, any> | [] | null,
  ): Response {
    const response: In_RESPONSE_Success = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(response);
  }

  // Pagination
  public static successPagination(
    res: Response,
    statusCode: number,
    message: string,
    data: Record<string, any>[] | object[] | any[],
    meta: In_API_AttributMeta,
  ): Response {
    const response: In_RESPONSE_Pagination = {
      success: true,
      message,
      data,
      meta: {
        ...meta,
      },
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(response);
  }

  // Error
  public static error(
    res: Response,
    statusCode: number,
    message: string,
    errors?: In_API_ErrorFormat[],
  ): Response {
    const response: In_RESPONSE_Error = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    };

    // Hanya masukkan array "errors" ke dalam response jika data errors-nya ada
    if (errors && errors.length > 0) {
      response.errors = errors;
    }

    response.timestamp = new Date().toISOString();

    return res.status(statusCode).json(response);
  }
}
