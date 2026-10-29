import { Request, Response, NextFunction } from 'express';
import { authService } from './service';
import { ResponseAPI } from '../../shared/utils/response-api.util';
import i18next from '../../lang/translation';

export class AuthController {
}

export const authController = new AuthController();
