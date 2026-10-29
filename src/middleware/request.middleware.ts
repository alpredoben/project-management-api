import { Request, Response, NextFunction } from 'express';
import {
  getLevelAccess,
  getRegionCode,
} from '../modules/purchase_request/purchase_request.lib';
import { AppError } from '../shared/utils/error.util';
import i18next from 'i18next';
import { HTTP_STATUS, Schema } from '../shared/constants';
import { WarehouseDataSource } from '../database/data-source';
import { In_JwtPayload } from '../interfaces/auth.interface';

const generateReqUser = (user: In_JwtPayload): In_JwtPayload => {
  const access = user?.akses_gudang ?? '';

  return {
    ...user,
    level: getLevelAccess(access),
    regionCode: getRegionCode(access),
  } as In_JwtPayload;
};

export const accessLevelMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.user) {
      return next(
        new AppError(
          i18next.t('error.default.unauthorized'),
          HTTP_STATUS.UNAUTHORIZED,
          req.user
        )
      );
    }

    req.user = generateReqUser(req.user as In_JwtPayload);
    next();
  } catch (error) {
    next(error);
  }
};

export const readPermissionPurchaseRequestMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params['id'];

    req.user = generateReqUser(req.user as In_JwtPayload);

    const result = await WarehouseDataSource.query(
      `SELECT kode_gudang, kd_region FROM gudang.${Schema.Warehouse.PurchaseRequest} WHERE id = ?`,
      [id]
    );

    if (!result || result?.length <= 0) {
      throw new AppError(
        i18next.t('error.default.not_found_param', { m: 'Purchase Request' }),
        HTTP_STATUS.NOT_FOUND
      );
    }

    const data = result[0];
    if (req.user?.['level'] === 'pusat') return next();
    if (
      req.user?.['level'] === 'up' &&
      data.kd_region === req.user?.['regionCode']
    )
      return next();
    if (
      req.user?.['level'] === 'ulp' &&
      data.kode_gudang === req.user?.akses_gudang
    )
      return next();

    throw new AppError(
      i18next.t('error.purchase_order.access_denied'),
      HTTP_STATUS.FORBIDDEN
    );
  } catch (error) {
    next(error);
  }
};
