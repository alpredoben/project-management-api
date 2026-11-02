import { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "../../shared/constants";
import {
  handle,
  handleList,
  idParam,
  parseListQuery,
  pick,
} from "../../shared/utils/controller.util";
import { makeBaseAudit } from "../../shared/utils/helper";
import { USER_SORT_FIELDS, USER_UPDATABLE_FIELDS } from "./dto";
import { service } from "./services";

const DEFAULT_SORT_FIELD = "created_at";

const xlsxFilename = (): string =>
  `users-${new Date().toISOString().slice(0, 10)}.xlsx`;

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
      pick(req.body, USER_UPDATABLE_FIELDS),
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

  public fetchPagination = handleList(
    "User",
    USER_SORT_FIELDS,
    DEFAULT_SORT_FIELD,
    (query) => service.fetchPagination(query),
  );

  public exportUsers = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query = parseListQuery(req, USER_SORT_FIELDS, DEFAULT_SORT_FIELD);
      res
        .status(HTTP_STATUS.OK)
        .attachment(xlsxFilename())
        .send(await service.exportXlsx(query));
    } catch (error) {
      next(error);
    }
  };
}

export const userController = new UserController();
