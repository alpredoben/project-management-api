import { In_JwtPayload } from '../../interfaces/auth.interface';
import { TFunction } from 'i18next';

declare global {
  namespace Express {
    interface Request {
      user?: In_JwtPayload;
      token?: string;
      t?: TFunction;
    }
  }
}

export {};
