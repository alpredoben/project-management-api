import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../shared/utils/error.util';
import { HTTP_STATUS } from '../../shared/constants';
import { ResponseAPI } from '../../shared/utils/response-api.util';
import { In_DTO_Login, In_DTO_RefreshToken } from './dto';
import { service } from './service';

export class AuthController {
  public login = async (
    req: Request<unknown, unknown, In_DTO_Login>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await service.login(
        req.body.email,
        req.body.password,
        req.body.remember_me ?? false
      );

      ResponseAPI.success(
        res,
        HTTP_STATUS.OK,
        req.t?.('success.auth.login', { defaultValue: 'Login berhasil.' }) ??
          'Login berhasil.',
        result
      );
    } catch (error) {
      next(error);
    }
  };

  public refreshToken = async (
    req: Request<unknown, unknown, In_DTO_RefreshToken>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await service.refreshToken(req.body.refreshToken);
      ResponseAPI.success(
        res,
        HTTP_STATUS.OK,
        req.t?.('success.auth.token_refreshed', {
          defaultValue: 'Token berhasil diperbarui.',
        }) ?? 'Token berhasil diperbarui.',
        result
      );
    } catch (error) {
      next(error);
    }
  };

  public logout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(
          req.t?.('error.default.unauthorized', {
            defaultValue: 'Akses ditolak. Token tidak valid atau kedaluwarsa.',
          }) ?? 'Akses ditolak. Token tidak valid atau kedaluwarsa.',
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      await service.logout(userId);
      ResponseAPI.success(
        res,
        HTTP_STATUS.OK,
        req.t?.('success.auth.logout', { defaultValue: 'Logout berhasil.' }) ??
          'Logout berhasil.'
      );
    } catch (error) {
      next(error);
    }
  };

  public getMe = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(
          req.t?.('error.default.unauthorized', {
            defaultValue: 'Akses ditolak. Token tidak valid atau kedaluwarsa.',
          }) ?? 'Akses ditolak. Token tidak valid atau kedaluwarsa.',
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      const profile = await service.getProfile(userId);
      ResponseAPI.success(
        res,
        HTTP_STATUS.OK,
        req.t?.('success.default.retrieved', {
          m: 'Profil pengguna',
          defaultValue: 'Profil pengguna berhasil diambil.',
        }) ?? 'Profil pengguna berhasil diambil.',
        profile
      );
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
