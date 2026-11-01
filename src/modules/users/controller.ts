import { NextFunction, Request, RequestHandler, Response } from "express";
import {
  In_DTO_UpdateUser,
  In_DTO_UserListQuery,
  T_OrderDirection,
  T_UserSortField,
  USER_SORT_FIELDS,
  USER_UPDATABLE_FIELDS,
} from "./dto";
import { HTTP_STATUS } from "../../shared/constants";
import { getStringMessage, makeBaseAudit } from "../../shared/utils/helper";
import { getPageAndLimit } from "../../shared/utils/pagination.util";
import { ResponseAPI } from "../../shared/utils/response-api.util";
import { service } from "./services";

const SUCCESS_VERB = {
  created: "disimpan",
  retrieved: "diambil",
  updated: "diperbarui",
  deleted: "dihapus",
} as const;

const DEFAULT_SORT_FIELD: T_UserSortField = "created_at";
const xlsxFilename = (): string =>
  `users-${new Date().toISOString().slice(0, 10)}.xlsx`;

const asString = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

const idParam = (req: Request): string => req.params["id"] as string;

/** Hanya field yang boleh diubah yang diteruskan (mencegah mass assignment). */
const pickUpdatableFields = (
  body: Record<string, unknown>,
): In_DTO_UpdateUser =>
  Object.fromEntries(
    USER_UPDATABLE_FIELDS.filter((field) => body[field] !== undefined).map(
      (field) => [field, body[field]],
    ),
  );

/** Normalisasi query string menjadi filter list user yang aman dipakai repository. */
const parseListQuery = (req: Request): In_DTO_UserListQuery => {
  const { currentPage, perPage } = getPageAndLimit({
    page: asString(req.query["page"]),
    limit: asString(req.query["limit"]),
  });
  const sortBy = asString(req.query["sort_by"]);
  const orderBy: T_OrderDirection =
    asString(req.query["order_by"])?.toUpperCase() === "ASC" ? "ASC" : "DESC";

  return {
    page: currentPage,
    limit: perPage,
    sort_by:
      USER_SORT_FIELDS.find((field) => field === sortBy) ?? DEFAULT_SORT_FIELD,
    order_by: orderBy,
    search: asString(req.query["search"])?.trim() ?? "",
  };
};

/**
 * Membungkus action menjadi request handler: menjalankan action,
 * mengirim response sukses, dan meneruskan error ke error middleware.
 */
const handle =
  (
    status: number,
    kind: keyof typeof SUCCESS_VERB,
    label: string,
    action: (req: Request) => Promise<object | void>,
  ): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = (await action(req)) as object | undefined;
      ResponseAPI.success(
        res,
        status,
        getStringMessage(
          req,
          `success.default.${kind}`,
          `Data ${label} berhasil ${SUCCESS_VERB[kind]}.`,
        ),
        data,
      );
    } catch (error) {
      next(error);
    }
  };

export class UserController {
  public store = handle(HTTP_STATUS.CREATED, "created", "User", (req) =>
    service.store(req.body, makeBaseAudit(req, "create")),
  );

  public fetchById = handle(HTTP_STATUS.OK, "retrieved", "User", (req) =>
    service.fetchById(idParam(req)),
  );

  public update = handle(HTTP_STATUS.OK, "updated", "User", (req) =>
    service.update(
      idParam(req),
      pickUpdatableFields(req.body),
      makeBaseAudit(req, "update"),
    ),
  );

  public delete = handle(HTTP_STATUS.OK, "deleted", "User", (req) =>
    service.delete(idParam(req), makeBaseAudit(req, "delete")),
  );

  public unactivated = handle(HTTP_STATUS.OK, "updated", "Status user", (req) =>
    service.unactivate(idParam(req), makeBaseAudit(req, "update")),
  );

  public changePassword = handle(
    HTTP_STATUS.OK,
    "updated",
    "Password user",
    (req) =>
      service.changePassword(
        idParam(req),
        req.body.new_password,
        makeBaseAudit(req, "update"),
      ),
  );

  public addUserRole = handle(HTTP_STATUS.OK, "updated", "Role user", (req) =>
    service.addUserRole(
      idParam(req),
      req.body.role_ids,
      makeBaseAudit(req, "update"),
    ),
  );

  public changeAvatar = handle(
    HTTP_STATUS.OK,
    "updated",
    "Avatar user",
    (req) =>
      service.changeAvatar(
        idParam(req),
        req.file,
        makeBaseAudit(req, "update"),
      ),
  );

  public fetchPagination = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { data, meta } = await service.fetchPagination(parseListQuery(req));
      ResponseAPI.successPagination(
        res,
        HTTP_STATUS.OK,
        getStringMessage(
          req,
          "success.default.retrieved",
          "Data User berhasil diambil.",
        ),
        data,
        meta,
      );
    } catch (error) {
      next(error);
    }
  };

  public exportUsers = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const buffer = await service.exportXlsx(parseListQuery(req));
      res.status(HTTP_STATUS.OK).attachment(xlsxFilename()).send(buffer);
    } catch (error) {
      next(error);
    }
  };
}

export const userController = new UserController();
