import { NextFunction, Request, RequestHandler, Response } from "express";
import { HTTP_STATUS } from "../../shared/constants";
import { ResponseAPI } from "../../shared/utils/response-api.util";
import { authService as service } from "./service";

const handle =
  (
    statusCode: number,
    message: string,
    action: (req: Request) => Promise<unknown>,
  ): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await action(req);
      ResponseAPI.success(res, statusCode, message, data as object | undefined);
    } catch (error) {
      next(error);
    }
  };

export class AuthController {

  register = handle(HTTP_STATUS.CREATED, "Registrasi berhasil. Periksa email untuk verifikasi.", (req) =>
    service.register(req.body),
  );

  verifyEmail = handle(HTTP_STATUS.OK, "Email berhasil diverifikasi.", (req) =>
    service.verifyEmail(String(req.query["token"])),
  );

  login = handle(HTTP_STATUS.OK, "Login berhasil.", (req) =>
    service.login(req.body),
  );

  forgotPassword = handle(
    HTTP_STATUS.OK,
    "Jika email terdaftar, instruksi reset kata sandi akan dikirim.",
    (req) => service.forgotPassword(req.body),
  );

  resetPassword = handle(HTTP_STATUS.OK, "Kata sandi berhasil diubah.", (req) =>
    service.resetPassword(
      req.body,
      String(req.query["token"] ?? (req.body ?? {}).token),
    ),
  );

  refreshToken = handle(HTTP_STATUS.OK, "Token berhasil diperbarui.", (req) =>
    service.refreshToken(
      String(req.body.access_token ?? req.body.refresh_token),
    ),
  );

  logout = handle(HTTP_STATUS.OK, "Logout berhasil.", (req) =>
    service.logout(req.user!.id),
  );

  me = handle(HTTP_STATUS.OK, "Profil berhasil diambil.", (req) =>
    service.getProfile(req.user!.id),
  );
}