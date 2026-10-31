import { NextFunction, Request, Response } from 'express';
import { JwtService } from '../pkg/jwt';
import { AppError } from '../shared/utils/error.util';
import { HTTP_STATUS } from '../shared/constants';

const createUnauthorizedError = (req: Request): AppError =>
  new AppError(
    req.t?.('error.default.unauthorized', {
      defaultValue: 'Akses ditolak. Token tidak valid atau kedaluwarsa.',
    }) ?? 'Akses ditolak. Token tidak valid atau kedaluwarsa.',
    HTTP_STATUS.UNAUTHORIZED
  );

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const match = req.headers.authorization?.match(/^Bearer\s+(\S+)$/i);
  if (!match) {
    next(createUnauthorizedError(req));
    return;
  }

  const token = match[1];
  try {
    const user = JwtService.verifyToken(token, 'access');
    req.user = user;
    req.token = token;
    next();
  } catch {
    next(createUnauthorizedError(req));
  }
};
