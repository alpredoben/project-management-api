import { HTTP_STATUS } from "../../shared/constants";
import { handle, handleList, pick } from "../../shared/utils/controller.util";
import { reqIdParam } from "../../shared/utils/helper";
import {
  PERMISSION_SORT_FIELDS,
  PermissionSortField,
} from "./dto";
import { permissionService as service } from "./service";

export class PermissionController {
  list = handleList<PermissionSortField>(
    "permission",
    PERMISSION_SORT_FIELDS,
    "createdAt",
    (query) => service.list(query),
  );

  findById = handle(HTTP_STATUS.OK, "retrieved", "permission", (req) =>
    service.findById(reqIdParam(req)),
  );

  create = handle(HTTP_STATUS.CREATED, "created", "permission", (req) =>
    service.create({
      name: req.body.name,
      module: req.body.module,
      description: req.body.description,
    }),
  );

  update = handle(HTTP_STATUS.OK, "updated", "permission", (req) =>
    service.update(
      reqIdParam(req),
      pick(req.body, ["name", "module", "description"]),
    ),
  );

  delete = handle(HTTP_STATUS.OK, "deleted", "permission", (req) =>
    service.delete(reqIdParam(req)),
  );
}