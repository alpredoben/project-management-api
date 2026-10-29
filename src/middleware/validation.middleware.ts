import { Request, Response, NextFunction, RequestHandler } from 'express';
import {
  validationResult,
  ValidationChain,
  ValidationError,
} from 'express-validator';
import { AppError } from '../shared/utils/error.util';
import { In_ErrorDetail } from '../interfaces/responseApi.interface';

/**
 * Higher-order middleware for run and check array rules
 * @param validations Array ValidationChain dari express-validator (mis. loginValidation)
 */
export const validationMiddleware = (
  validations: ValidationChain[]
): RequestHandler => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    await Promise.all(validations.map((rule) => rule.run(req)));

    const result = validationResult(req);

    if (!result.isEmpty()) {
      const errors: In_ErrorDetail[] = result
        .array()
        .map((err: ValidationError) => ({
          field: err.type === 'field' ? err.path : 'unknown',
          message: err.msg,
        }));

      const message = req.t
        ? req.t('error.default.validation', {
            defaultValue: 'Validasi gagal. Periksa kembali data yang dikirim.',
          })
        : 'Validasi gagal. Periksa kembali data yang dikirim.';

      return next(new AppError(message, 422, errors));
    }

    next();
  };
};
