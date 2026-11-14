
import { HTTP_STATUS } from "../../shared/constants";
import {
  handle,
  handleList,
  pick,
} from "../../shared/utils/controller.util";
import { createSlug, makeBaseAudit, reqIdParam } from "../../shared/utils/helper";
import { ROLE_SORT_FIELDS, RoleSortField } from "./dto";
import { roleService as service } from "./service";

export class RoleController {
  fetchPagination = handleList<RoleSortField>(
    "role",
    ROLE_SORT_FIELDS,
    "created_at",
    (query) => service.fetchPagination(query),
  );

  findById = handle(HTTP_STATUS.OK, "retrieved", "role", (req) =>
    service.findById(reqIdParam(req)),
  );

  create = handle(HTTP_STATUS.CREATED, "created", "role", (req) =>
     service.create({
        name: req.body.name,
        slug: createSlug(req.body.name),
        description: req.body.description ?? null,
        ...makeBaseAudit(req, 'create')
      })
  );

  update = handle(HTTP_STATUS.OK, "updated", "role", (req) =>
    service.update(reqIdParam(req), {...pick(req.body, ["name", "description"]), ...makeBaseAudit(req, 'update')}),
  );

  setPermissions = handle(HTTP_STATUS.OK, "updated", "role", (req) => {
    const permissionIds = Array.isArray(req.body)
      ? req.body
      : req.body.permissions;
    return service.setPermissions(reqIdParam(req), permissionIds);
  });

  delete = handle(HTTP_STATUS.OK, "deleted", "role", (req) =>
    service.delete(reqIdParam(req), makeBaseAudit(req, 'delete')),
  );
}