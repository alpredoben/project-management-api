import { Request, Response, NextFunction, RequestHandler } from "express";
import {
  validationResult,
  ValidationChain,
  ValidationError,
} from "express-validator";
import { AppError } from "../shared/utils/error.util";
import { In_API_ErrorFormat } from "../interfaces/responseApi.interface";

// High order middleware
export const validationMiddleware = (
  validations: ValidationChain[],
): RequestHandler => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await Promise.all(validations.map((rule) => rule.run(req)));

    const result = validationResult(req);

    if (!result.isEmpty()) {
      const errors: In_API_ErrorFormat[] = result
        .array()
        .map((err: ValidationError) => ({
          field: err.type === "field" ? err.path : "unknown",
          message: err.msg,
        }));

      const message = req.t
        ? req.t("error.default.validation", {
            defaultValue: "Validasi gagal. Periksa kembali data yang dikirim.",
          })
        : "Validasi gagal. Periksa kembali data yang dikirim.";

      return next(new AppError(message, 422, errors));
    }

    next();
  };
};
