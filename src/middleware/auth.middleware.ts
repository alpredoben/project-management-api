import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../pkg/jwt';
import { AppError } from '../shared/utils/error.util';

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('error.default.unauthorized', 401);
    }

    const token = authHeader.split(' ')[1];

    // Verified token
    const decodedPayload = JwtService.verifyToken(token);

    // Set token to request
    req.user = decodedPayload;
    req.token = token;
    next();
  } catch (error) {
    next(error);
  }
};
