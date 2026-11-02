import { HTTP_STATUS } from "../../shared/constants";
import {
  handle,
  handleList,
  idParam,
  pick,
} from "../../shared/utils/controller.util";
import { makeBaseAudit } from "../../shared/utils/helper";
import { MENU_FIELDS, MENU_SORT_FIELDS } from "./dto";
import { service } from "./services";

export class MenuController {
  public store = handle(HTTP_STATUS.CREATED, "created", "Menu", (req) =>
    service.store(req.body, makeBaseAudit(req, "create")),
  );

  public fetchById = handle(HTTP_STATUS.OK, "retrieved", "Menu", (req) =>
    service.findById(idParam(req)),
  );

  public update = handle(HTTP_STATUS.OK, "updated", "Menu", (req) =>
    service.update(
      idParam(req),
      pick(req.body, MENU_FIELDS),
      makeBaseAudit(req, "update"),
    ),
  );

  public delete = handle(HTTP_STATUS.OK, "deleted", "Menu", (req) =>
    service.delete(idParam(req), makeBaseAudit(req, "delete")),
  );

  public addRolePermissionMenu = handle(
    HTTP_STATUS.OK,
    "updated",
    "Permission menu",
    (req) =>
      service.addRolePermissionMenu(
        {
          role_id: req.body.role_id,
          menu_id: req.body.menu_id,
          permissions_ids: req.body.permissions_ids,
        },
        makeBaseAudit(req, "create"),
      ),
  );

  public fetchPagination = handleList(
    "Menu",
    MENU_SORT_FIELDS,
    "created_at",
    (query) => service.fetchPagination(query),
  );
}

export const menuController = new MenuController();
