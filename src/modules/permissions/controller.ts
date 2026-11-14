import { HTTP_STATUS } from "../../shared/constants";
import { handle, handleList, pick } from "../../shared/utils/controller.util";
import { makeBaseAudit, reqIdParam } from "../../shared/utils/helper";
import {
  PERMISSION_SORT_FIELDS,
  PermissionSortField,
} from "./dto";
import { permissionService as service } from "./service";

export class PermissionController {
  fetchPagination = handleList<PermissionSortField>(
    "permission",
    PERMISSION_SORT_FIELDS,
    "created_at",
    (query) => service.fetchPagination(query),
  );

  findById = handle(HTTP_STATUS.OK, "retrieved", "permission", (req) =>
    service.findById(reqIdParam(req)),
  );

  create = handle(HTTP_STATUS.CREATED, "created", "permission", (req) =>
    service.create({
      name: req.body.name,
      module: req.body.module,
      description: req.body.description ?? null,
      ...makeBaseAudit(req, 'create')
    }),
  );

  update = handle(HTTP_STATUS.OK, "updated", "permission", (req) =>
    service.update(
      reqIdParam(req),
      {
        ...pick(req.body, ["name", "module", "description"]),
        ...makeBaseAudit(req, 'update')
      },
    ),
  );

  delete = handle(HTTP_STATUS.OK, "deleted", "permission", (req) =>
    service.delete(reqIdParam(req), makeBaseAudit(req, 'delete')),
  );
}