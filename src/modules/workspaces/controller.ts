import { HTTP_STATUS } from "../../shared/constants";
import {
  handle,
  handleList,
  pick,
} from "../../shared/utils/controller.util";
import { createSlug, makeBaseAudit, reqIdParam } from "../../shared/utils/helper";
import { WORKSPACE_SORT_FIELDS, WorkspaceSortField } from "./dto";
import { workspaceService as service } from "./service";

export class WorkspaceController {
  fetchPagination = handleList<WorkspaceSortField>(
    "workspace",
    WORKSPACE_SORT_FIELDS,
    "created_at",
    (query) => service.fetchPagination(query),
  );

  findById = handle(HTTP_STATUS.OK, "retrieved", "workspace", (req) =>
    service.findById(reqIdParam(req)),
  );

  create = handle(HTTP_STATUS.CREATED, "created", "workspace", (req) =>
    service.create({
      name: req.body.name,
      slug: createSlug(req.body.name),
      logo_url: req.body.logo_url ?? null,
      ...makeBaseAudit(req, "create"),
    }),
  );

  update = handle(HTTP_STATUS.OK, "updated", "workspace", (req) =>
    service.update(reqIdParam(req), {
      ...pick(req.body, ["name", "logo_url"]),
      ...(req.body.name !== undefined
        ? { slug: createSlug(req.body.name) }
        : {}),
      ...makeBaseAudit(req, "update"),
    }),
  );

  delete = handle(HTTP_STATUS.OK, "deleted", "workspace", (req) =>
    service.delete(reqIdParam(req), makeBaseAudit(req, "delete")),
  );
}