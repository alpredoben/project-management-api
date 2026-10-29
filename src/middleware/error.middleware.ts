import { Request, Response, NextFunction } from 'express';
import logger from '../shared/utils/logger.util';
import { ResponseAPI } from '../shared/utils/response-api.util';
import { AppError } from '../shared/utils/error.util';
import { config } from '../config';

// Global Error Handling Middleware
export const errorMiddleware = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;

  let message = req.t
    ? req.t('error.default.internal_server', {
        defaultValue: 'Internal Server Error',
      })
    : 'Internal Server Error';
  let errors = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err.name === 'QueryFailedError') {
    statusCode = 400;
    message = req.t
      ? req.t('error.default.database_conflict', {
          defaultValue: 'Database Conflict Error',
        })
      : 'Database Conflict Error';
  } else if (
    err.name === 'JsonWebTokenError' ||
    err.name === 'TokenExpiredError'
  ) {
    statusCode = 401;
    message = req.t
      ? req.t('error.default.unauthorized', {
          defaultValue: 'Unauthorized or Token Expired',
        })
      : 'Unauthorized or Token Expired';
  }

  const errorMeta = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.headers['x-forwarded-for'],
    userId: (req as any).user?.id || 'unauthenticated',
    stack: config.app.env === 'development' ? err.stack : undefined,
  };

  if (statusCode >= 500) {
    logger.error(`[Server Error] ${err.message}`, errorMeta);
  } else {
    logger.warn(`[Client Error] ${err.message}`, errorMeta);
  }

  if (config.app.env === 'development' && statusCode === 500) {
    message = err.message;
  }

  ResponseAPI.error(res, statusCode, message, errors);
};
